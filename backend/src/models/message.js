const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
  },
  to: {
    type: String,
    required: true,
  },
  from: String,
  subject: {
    type: String,
    required: true,
  },
  html: String,
  text: String,
  status: {
    type: String,
    enum: ['queued', 'sent', 'failed', 'bounced'],
    default: 'queued',
    index: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmtpProvider',
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 3,
  },
  lastError: String,
  sentAt: Date,
  metadata: {
    messageId: String,
    response: String,
    duration: Number,
  },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes are defined inline in the schema

module.exports = mongoose.model('Message', messageSchema);
