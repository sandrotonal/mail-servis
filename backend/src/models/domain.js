const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending',
  },
  verificationToken: {
    type: String,
    required: true,
  },
  dnsRecords: {
    spf: {
      value: String,
      verified: { type: Boolean, default: false },
    },
    dkim: {
      value: String,
      verified: { type: Boolean, default: false },
    },
    dmarc: {
      value: String,
      verified: { type: Boolean, default: false },
    },
  },
  verifiedAt: Date,
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.verificationToken;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes are defined inline in the schema

module.exports = mongoose.model('Domain', domainSchema);
