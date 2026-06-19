const mongoose = require('mongoose');

const dailyAnalyticsSchema = new mongoose.Schema({
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
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
  sent: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  spam: { type: Number, default: 0 },
  leads: { type: Number, default: 0 },
  submissions: { type: Number, default: 0 },
  countries: {
    type: Map,
    of: Number,
    default: {},
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

dailyAnalyticsSchema.index({ workspace: 1, date: 1 }, { unique: false });
dailyAnalyticsSchema.index({ workspace: 1, project: 1, date: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('DailyAnalytics', dailyAnalyticsSchema);
