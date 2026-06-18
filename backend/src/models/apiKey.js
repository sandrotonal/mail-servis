const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
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
    required: [true, 'API key name is required'],
    trim: true,
  },
  keyPrefix: {
    type: String,
    required: true,
  },
  keyHash: {
    type: String,
    required: true,
  },
  keyLastFour: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  permissions: {
    sendForms: {
      type: Boolean,
      default: true,
    },
    readSubmissions: {
      type: Boolean,
      default: false,
    },
    manageProjects: {
      type: Boolean,
      default: false,
    },
  },
  lastUsed: Date,
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.keyHash;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes are defined inline in the schema

module.exports = mongoose.model('ApiKey', apiKeySchema);
