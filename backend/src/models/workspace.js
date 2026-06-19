const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  logo: String,
  settings: {
    defaultFromName: String,
    defaultFromEmail: String,
    replyToAddress: String,
    customFooter: String,
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  monthlyUsage: {
    type: Number,
    default: 0,
  },
  monthlyLimit: {
    type: Number,
    default: 100,
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro', 'business'],
    default: 'free',
  },
  usageResetAt: {
    type: Date,
    default: () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    },
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

module.exports = mongoose.model('Workspace', workspaceSchema);
