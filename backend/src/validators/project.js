const Joi = require('joi');

const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Project name must be at least 2 characters',
    'string.max': 'Project name cannot exceed 100 characters',
    'any.required': 'Project name is required',
  }),
  settings: Joi.object({
    successMessage: Joi.string().optional(),
    redirectUrl: Joi.string().uri().optional().allow(''),
    sendConfirmation: Joi.boolean().optional(),
    allowedDomains: Joi.array().items(Joi.string()).optional(),
    enableFileUploads: Joi.boolean().optional(),
    maxFileSize: Joi.number().optional(),
    spamProtection: Joi.boolean().optional(),
    honeypotEnabled: Joi.boolean().optional(),
    recaptchaEnabled: Joi.boolean().optional(),
    collectIp: Joi.boolean().optional(),
    collectUserAgent: Joi.boolean().optional(),
  }).optional(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  isActive: Joi.boolean().optional(),
  settings: Joi.object({
    successMessage: Joi.string().optional(),
    redirectUrl: Joi.string().uri().optional().allow(''),
    sendConfirmation: Joi.boolean().optional(),
    allowedDomains: Joi.array().items(Joi.string()).optional(),
    enableFileUploads: Joi.boolean().optional(),
    maxFileSize: Joi.number().optional(),
    spamProtection: Joi.boolean().optional(),
    honeypotEnabled: Joi.boolean().optional(),
    recaptchaEnabled: Joi.boolean().optional(),
    collectIp: Joi.boolean().optional(),
    collectUserAgent: Joi.boolean().optional(),
  }).optional(),
});

const formFieldSchema = Joi.object({
  type: Joi.string().valid('text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'date', 'file').required(),
  name: Joi.string().required(),
  label: Joi.string().required(),
  placeholder: Joi.string().optional().allow(''),
  required: Joi.boolean().optional(),
  options: Joi.array().items(Joi.string()).optional(),
  validation: Joi.object({
    minLength: Joi.number().optional(),
    maxLength: Joi.number().optional(),
    pattern: Joi.string().optional(),
  }).optional(),
  order: Joi.number().optional(),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  formFieldSchema,
};
