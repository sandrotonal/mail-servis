const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
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
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    defaultValue: String,
    description: String,
    required: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    enum: ['notification', 'marketing', 'transactional', 'autoresponse', 'custom'],
    default: 'custom'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  previewData: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: Date,
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

emailTemplateSchema.index({ workspace: 1, slug: 1 }, { unique: true });
emailTemplateSchema.index({ workspace: 1, category: 1 });
emailTemplateSchema.index({ workspace: 1, status: 1 });

emailTemplateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

emailTemplateSchema.statics.getDefaultTemplates = function() {
  return [
    {
      name: 'Form Submission Notification',
      slug: 'form-submission-notification',
      description: 'Notification sent when a form is submitted',
      subject: 'New form submission from {{formName}}',
      category: 'notification',
      isSystem: true,
      variables: [
        { name: 'formName', description: 'Name of the form', required: true },
        { name: 'submitterName', description: 'Name of the person who submitted', required: false },
        { name: 'submitterEmail', description: 'Email of the submitter', required: false },
        { name: 'submissionData', description: 'Form submission data', required: true },
        { name: 'submissionDate', description: 'Date of submission', required: true }
      ],
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; padding: 12px; background: white; border-radius: 6px; }
    .field-label { font-weight: bold; color: #4F46E5; margin-bottom: 5px; }
    .field-value { color: #333; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Form Submission</h1>
      <p>{{formName}}</p>
    </div>
    <div class="content">
      <p>You have received a new submission on {{submissionDate}}.</p>
      {{#if submitterName}}
      <p><strong>From:</strong> {{submitterName}} ({{submitterEmail}})</p>
      {{/if}}
      <div style="margin-top: 20px;">
        {{#each submissionData}}
        <div class="field">
          <div class="field-label">{{this.label}}</div>
          <div class="field-value">{{this.value}}</div>
        </div>
        {{/each}}
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from your form platform.</p>
    </div>
  </div>
</body>
</html>`,
      textContent: `New Form Submission - {{formName}}

Submission Date: {{submissionDate}}
{{#if submitterName}}From: {{submitterName}} ({{submitterEmail}}){{/if}}

Submission Details:
{{#each submissionData}}
{{this.label}}: {{this.value}}
{{/each}}

---
This is an automated notification.`
    },
    {
      name: 'Welcome Email',
      slug: 'welcome-email',
      description: 'Welcome email sent to new users',
      subject: 'Welcome to {{companyName}}!',
      category: 'notification',
      isSystem: true,
      variables: [
        { name: 'userName', description: 'Name of the user', required: true },
        { name: 'userEmail', description: 'Email of the user', required: true },
        { name: 'companyName', description: 'Your company name', required: true },
        { name: 'dashboardUrl', description: 'URL to dashboard', required: true }
      ],
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 14px 28px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi {{userName}},</p>
      <p>Welcome to {{companyName}}! We're thrilled to have you on board.</p>
      <p>Your account has been successfully created and you're ready to start building amazing forms.</p>
      <p style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
      </p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The {{companyName}} Team</p>
    </div>
    <div class="footer">
      <p>© {{companyName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
      textContent: `Welcome to {{companyName}}!

Hi {{userName}},

Welcome! We're thrilled to have you on board.

Your account has been successfully created and you're ready to start building amazing forms.

Get Started: {{dashboardUrl}}

If you have any questions, feel free to reach out to our support team.

Best regards,
The {{companyName}} Team`
    }
  ];
};

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

module.exports = EmailTemplate;
