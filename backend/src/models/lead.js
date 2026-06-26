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
  company: String,
  jobTitle: String,
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'new',
    index: true,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  source: {
    type: String,
    default: 'form',
  },
  tags: [String],
  notes: [{
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['note', 'call', 'email', 'meeting', 'task'],
      default: 'note',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  activities: [{
    type: {
      type: String,
      required: true,
    },
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: mongoose.Schema.Types.Mixed,
  }],
  customFields: mongoose.Schema.Types.Mixed,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedAt: Date,
  estimatedValue: Number,
  actualValue: Number,
  currency: {
    type: String,
    default: 'USD',
  },
  convertedAt: Date,
  nextFollowUp: Date,
  lastContactedAt: Date,
  isSpam: {
    type: Boolean,
    default: false,
  },
  qualityScore: Number,
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
});

leadSchema.index({ workspace: 1, score: -1 });
leadSchema.index({ workspace: 1, assignedTo: 1 });
leadSchema.index({ nextFollowUp: 1 });

leadSchema.pre('save', async function(next) {
  if (this.isModified('status') || this.isModified('email') || this.isNew) {
    const leadScoringService = require('../services/leadScoringService');
    this.score = await leadScoringService.calculateScore(this);
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
