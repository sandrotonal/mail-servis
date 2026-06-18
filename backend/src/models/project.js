const mongoose = require('mongoose');
const crypto = require('crypto');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  projectId: {
    type: String,
    unique: true,
    index: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  settings: {
    successMessage: {
      type: String,
      default: 'Thank you! Your message has been sent successfully.',
    },
    redirectUrl: String,
    sendConfirmation: {
      type: Boolean,
      default: false,
    },
    confirmationTemplate: String,
    allowedDomains: [String],
    enableFileUploads: {
      type: Boolean,
      default: false,
    },
    maxFileSize: {
      type: Number,
      default: 5242880,
    },
    enableAttachments: {
      type: Boolean,
      default: false,
    },
    spamProtection: {
      type: Boolean,
      default: true,
    },
    honeypotEnabled: {
      type: Boolean,
      default: true,
    },
    recaptchaEnabled: {
      type: Boolean,
      default: false,
    },
    turnstileEnabled: {
      type: Boolean,
      default: false,
    },
    collectIp: {
      type: Boolean,
      default: true,
    },
    collectUserAgent: {
      type: Boolean,
      default: true,
    },
    collectLocation: {
      type: Boolean,
      default: false,
    },
  },
  fields: [{
    type: {
      type: String,
      enum: ['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'date', 'file'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    placeholder: String,
    required: {
      type: Boolean,
      default: false,
    },
    options: [String],
    validation: {
      minLength: Number,
      maxLength: Number,
      pattern: String,
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  totalSubmissions: {
    type: Number,
    default: 0,
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

projectSchema.pre('save', function (next) {
  if (!this.projectId) {
    this.projectId = `proj_${crypto.randomBytes(16).toString('hex')}`;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
