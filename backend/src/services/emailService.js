const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporters = new Map();
    this.primaryTransporter = null;
    this.failoverTransporter = null;
    this._initTransporters();
  }

  _initTransporters() {
    if (config.smtp.user && config.smtp.pass) {
      this.primaryTransporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5,
      });

      this.primaryTransporter.on('error', (err) => {
        logger.error('Primary SMTP transporter error:', err);
      });
    }

    if (config.smtpFailover.user && config.smtpFailover.pass) {
      this.failoverTransporter = nodemailer.createTransport({
        host: config.smtpFailover.host,
        port: config.smtpFailover.port,
        secure: config.smtpFailover.secure,
        auth: {
          user: config.smtpFailover.user,
          pass: config.smtpFailover.pass,
        },
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
      });
    }
  }

  _getTransporter(provider) {
    if (provider) {
      const key = provider._id.toString();
      if (!this.transporters.has(key)) {
        const transporter = nodemailer.createTransport({
          host: provider.host,
          port: provider.port,
          secure: provider.secure,
          auth: {
            user: provider.username,
            pass: provider.password,
          },
          pool: true,
          maxConnections: 3,
          maxMessages: 50,
        });
        this.transporters.set(key, transporter);
      }
      return this.transporters.get(key);
    }
    return this.primaryTransporter;
  }

  async sendMail({ to, from, subject, html, text, provider, attachments }) {
    const transporter = this._getTransporter(provider);
    let lastError;

    const mailOptions = {
      to,
      from: from || config.smtp.user,
      subject,
      html,
      text,
      attachments,
    };

    if (transporter) {
      try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId, response: info.response };
      } catch (err) {
        lastError = err;
        logger.warn('Primary SMTP failed, trying failover:', err.message);
      }
    }

    if (this.failoverTransporter) {
      try {
        const info = await this.failoverTransporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId, response: info.response, failover: true };
      } catch (err) {
        lastError = err;
      }
    }

    logger.error('All SMTP providers failed:', lastError);
    return { success: false, error: lastError?.message || 'No SMTP configured' };
  }

  async sendVerificationEmail(to, token) {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;
    return this.sendMail({
      to,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
          <p>This link expires in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(to, token) {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    return this.sendMail({
      to,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendFormNotification({ to, from, subject, formData, project, files }) {
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Form Submission: ${project.name}</h2>
        <table style="width: 100%; border-collapse: collapse;">
    `;

    for (const [key, value] of Object.entries(formData)) {
      if (key.startsWith('_')) continue;
      html += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${key}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${value}</td>
        </tr>
      `;
    }

    html += `</table></div>`;

    return this.sendMail({ to, from, subject, html });
  }
}

module.exports = new EmailService();
