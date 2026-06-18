const mongoose = require('mongoose');

const smtpProviderSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Provider name is required'],
    trim: true,
  },
  provider: {
    type: String,
    enum: ['gmail', 'brevo', 'mailgun', 'ses', 'resend', 'custom'],
    required: true,
  },
  host: {
    type: String,
    required: [true, 'SMTP host is required'],
  },
  port: {
    type: Number,
    default: 587,
  },
  secure: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    required: [true, 'SMTP username is required'],
  },
  password: {
    type: String,
    required: [true, 'SMTP password is required'],
  },
  fromName: String,
  fromEmail: {
    type: String,
    required: [true, 'From email is required'],
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  failoverOrder: {
    type: Number,
    default: 0,
  },
  dailyQuota: Number,
  sentToday: {
    type: Number,
    default: 0,
  },
  lastTested: Date,
  lastTestResult: String,
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes are defined inline in the schema

module.exports = mongoose.model('SmtpProvider', smtpProviderSchema);
