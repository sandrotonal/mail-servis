const BaseRepository = require('./base');
const { User } = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email) {
    return this.model.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async findByIdWithPassword(id) {
    return this.model.findById(id).select('+password');
  }

  async updatePassword(userId, newPassword) {
    const user = await this.model.findById(userId).select('+password');
    if (!user) return null;
    user.password = newPassword;
    await user.save();
    return user;
  }

  async addRefreshToken(userId, token) {
    return this.model.findByIdAndUpdate(userId, {
      $push: { refreshTokens: token },
    });
  }

  async removeRefreshToken(userId, token) {
    return this.model.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: token },
    });
  }

  async clearRefreshTokens(userId) {
    return this.model.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    });
  }
}

module.exports = new UserRepository();
