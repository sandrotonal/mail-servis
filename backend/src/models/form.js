const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'date', 'file'],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  helpText: {
    type: String
  },
  required: {
    type: Boolean,
    default: false
  },
  validation: {
    min: Number,
    max: Number,
    minLength: Number,
    maxLength: Number,
    pattern: String,
    customMessage: String
  },
  options: [{
    label: String,
    value: String
  }],
  fileConfig: {
    maxSize: {
      type: Number,
      default: 5242880
    },
    allowedTypes: [{
      type: String,
      enum: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
             'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
             'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
             'application/zip']
    }],
    multiple: {
      type: Boolean,
      default: false
    }
  },
  conditionalLogic: {
    enabled: {
      type: Boolean,
      default: false
    },
    conditions: [{
      fieldId: String,
      operator: {
        type: String,
        enum: ['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan']
      },
      value: String
    }],
    action: {
      type: String,
      enum: ['show', 'hide', 'require']
    }
  },
  order: {
    type: Number,
    required: true
  },
  width: {
    type: String,
    enum: ['full', 'half', 'third', 'quarter'],
    default: 'full'
  }
}, { _id: false });

const formSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fields: [formFieldSchema],
  settings: {
    submitButtonText: {
      type: String,
      default: 'Submit'
    },
    submitButtonColor: {
      type: String,
      default: '#4F46E5'
    },
    successMessage: {
      type: String,
      default: 'Thank you for your submission!'
    },
    errorMessage: {
      type: String,
      default: 'Something went wrong. Please try again.'
    },
    redirectUrl: {
      type: String
    },
    redirectDelay: {
      type: Number,
      default: 3
    },
    recaptcha: {
      enabled: {
        type: Boolean,
        default: false
      },
      siteKey: String,
      secretKey: String
    },
    honeypot: {
      enabled: {
        type: Boolean,
        default: true
      },
      fieldName: {
        type: String,
        default: '_gotcha'
      }
    },
    emailNotifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      recipients: [String],
      template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmailTemplate'
      }
    },
    autoResponse: {
      enabled: {
        type: Boolean,
        default: false
      },
      template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmailTemplate'
      }
    }
  },
  styling: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'custom'],
      default: 'light'
    },
    primaryColor: {
      type: String,
      default: '#4F46E5'
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF'
    },
    borderRadius: {
      type: Number,
      default: 8
    },
    fontSize: {
      type: Number,
      default: 16
    },
    fontFamily: {
      type: String,
      default: 'Inter, sans-serif'
    },
    customCSS: String
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft',
    index: true
  },
  submissionCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  lastSubmissionAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

formSchema.index({ project: 1, status: 1 });
formSchema.index({ workspace: 1, createdAt: -1 });
formSchema.index({ createdBy: 1 });

formSchema.methods.incrementSubmissionCount = async function() {
  this.submissionCount += 1;
  this.lastSubmissionAt = new Date();
  this.conversionRate = this.viewCount > 0 
    ? (this.submissionCount / this.viewCount) * 100 
    : 0;
  await this.save();
};

formSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  this.conversionRate = this.viewCount > 0 
    ? (this.submissionCount / this.viewCount) * 100 
    : 0;
  await this.save();
};

formSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    fields: this.fields,
    settings: {
      submitButtonText: this.settings.submitButtonText,
      submitButtonColor: this.settings.submitButtonColor,
      redirectUrl: this.settings.redirectUrl,
      recaptcha: {
        enabled: this.settings.recaptcha.enabled,
        siteKey: this.settings.recaptcha.siteKey
      }
    },
    styling: this.styling
  };
};

const Form = mongoose.model('Form', formSchema);

module.exports = Form;
