const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Webhook name is required'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Webhook URL is required'],
  },
  events: [{
    type: String,
    enum: [
      'message.received',
      'message.sent',
      'message.failed',
      'project.created',
      'api_key.created',
      'lead.created',
      'lead.status_changed',
    ],
    required: true,
  }],
  secret: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  retryCount: {
    type: Number,
    default: 3,
  },
  timeout: {
    type: Number,
    default: 5000,
  },
  lastTriggered: Date,
  lastStatus: {
    type: String,
    enum: ['success', 'failed'],
  },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.secret;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes are defined inline in the schema

module.exports = mongoose.model('Webhook', webhookSchema);
