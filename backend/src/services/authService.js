const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const { userRepository, workspaceRepository } = require('../repositories');
const { WorkspaceMember } = require('../models');
const { AppError, ConflictError, UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');
const emailService = require('./emailService');

class AuthService {
  generateToken(userId) {
    return jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, config.jwt.refreshSecret);
  }

  generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async register({ name, email, password, workspaceName }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email already exists.');
    }

    const user = await userRepository.create({ name, email, password });
    const wsName = workspaceName || `${name}'s Workspace`;
    const slug = `${wsName.toLowerCase().replace(/\s+/g, '-')}-${crypto.randomBytes(4).toString('hex')}`;

    const workspace = await workspaceRepository.create({
      name: wsName,
      slug,
      owner: user._id,
    });

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: user._id,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
    });

    const token = this.generateEmailVerificationToken();
    user.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await emailService.sendVerificationEmail(user.email, token);
    } catch (err) {
      logger.warn('Failed to send verification email:', err);
    }

    const accessToken = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      user: user.toSafeObject(),
      workspace: workspace.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  async socialLogin({ email, name, provider, providerId }) {
    let user = await userRepository.findByEmail(email);

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await userRepository.create({
        name,
        email,
        password: randomPassword,
        isEmailVerified: true,
      });

      const wsName = `${name}'s Workspace`;
      const slug = `${wsName.toLowerCase().replace(/\s+/g, '-')}-${crypto.randomBytes(4).toString('hex')}`;

      const workspace = await workspaceRepository.create({
        name: wsName,
        slug,
        owner: user._id,
      });

      await WorkspaceMember.create({
        workspace: workspace._id,
        user: user._id,
        role: 'owner',
        status: 'active',
        joinedAt: new Date(),
      });
    }

    user.lastLogin = new Date();
    user.socialProvider = provider;
    user.socialProviderId = providerId;
    
    const accessToken = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    user.lastLogin = new Date();
    const accessToken = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    let decoded;
    try {
      decoded = this.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }

    const user = await userRepository.findByIdWithPassword(decoded.id);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or deactivated.');
    }

    if (!user.refreshTokens.includes(refreshToken)) {
      await userRepository.clearRefreshTokens(user._id);
      throw new UnauthorizedError('Refresh token has been revoked. Please login again.');
    }

    const newAccessToken = this.generateToken(user._id);
    const newRefreshToken = this.generateRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId, refreshToken) {
    await userRepository.removeRefreshToken(userId, refreshToken);
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const resetToken = this.generatePasswordResetToken();
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (err) {
      logger.warn('Failed to send password reset email:', err);
    }

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const { User } = require('../models');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      throw new AppError('Invalid or expired reset token.', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    return { message: 'Password has been reset successfully.' };
  }

  async verifyEmail(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token.', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully.' };
  }
}

module.exports = new AuthService();
