const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  name: String,
  phone: String,
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'],
    default: 'new',
    index: true,
  },
  source: {
    type: String,
    default: 'form',
  },
  tags: [String],
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  customFields: mongoose.Schema.Types.Mixed,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  convertedAt: Date,
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

module.exports = mongoose.model('Lead', leadSchema);
