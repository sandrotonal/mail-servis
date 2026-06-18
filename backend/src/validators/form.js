const Joi = require('joi');

const formSubmissionSchema = Joi.object({
  name: Joi.string().max(500).optional().allow(''),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  subject: Joi.string().max(500).optional().allow(''),
  message: Joi.string().max(10000).optional().allow(''),
  phone: Joi.string().max(50).optional().allow(''),
  _honeypot: Joi.string().allow('').optional(),
  _turnstile: Joi.string().optional(),
  'g-recaptcha-response': Joi.string().optional(),
}).pattern(Joi.string(), Joi.any());

const smtpProviderSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  provider: Joi.string().valid('gmail', 'brevo', 'mailgun', 'ses', 'resend', 'custom').required(),
  host: Joi.string().required(),
  port: Joi.number().default(587),
  secure: Joi.boolean().default(false),
  username: Joi.string().required(),
  password: Joi.string().required(),
  fromName: Joi.string().optional(),
  fromEmail: Joi.string().email().required(),
  isPrimary: Joi.boolean().default(false),
  failoverOrder: Joi.number().optional(),
  dailyQuota: Joi.number().optional(),
});

const webhookSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  url: Joi.string().uri().required(),
  events: Joi.array().items(Joi.string().valid(
    'message.received', 'message.sent', 'message.failed',
    'project.created', 'api_key.created', 'lead.created', 'lead.status_changed'
  )).min(1).required(),
  isActive: Joi.boolean().optional(),
  retryCount: Joi.number().min(0).max(10).optional(),
  timeout: Joi.number().min(1000).max(30000).optional(),
});

const apiKeySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  project: Joi.string().optional(),
  permissions: Joi.object({
    sendForms: Joi.boolean().optional(),
    readSubmissions: Joi.boolean().optional(),
    manageProjects: Joi.boolean().optional(),
  }).optional(),
  expiresAt: Joi.date().optional(),
});

module.exports = {
  formSubmissionSchema,
  smtpProviderSchema,
  webhookSchema,
  apiKeySchema,
};
