const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  metadata: {
    ip: String,
    userAgent: String,
    referer: String,
    country: String,
    city: String,
   isp: String,
  },
  files: [{
    fieldName: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    storageType: String,
  }],
  spamScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isSpam: {
    type: Boolean,
    default: false,
  },
  isRead: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.model('Submission', submissionSchema);
