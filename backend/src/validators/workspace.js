const Joi = require('joi');

const createWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Workspace name must be at least 2 characters',
    'string.max': 'Workspace name cannot exceed 100 characters',
    'any.required': 'Workspace name is required',
  }),
  settings: Joi.object({
    defaultFromName: Joi.string().optional(),
    defaultFromEmail: Joi.string().email().optional(),
    replyToAddress: Joi.string().email().optional(),
    customFooter: Joi.string().optional(),
    timezone: Joi.string().optional(),
  }).optional(),
});

const updateWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  settings: Joi.object({
    defaultFromName: Joi.string().optional(),
    defaultFromEmail: Joi.string().email().optional(),
    replyToAddress: Joi.string().email().optional(),
    customFooter: Joi.string().optional(),
    timezone: Joi.string().optional(),
  }).optional(),
});

const inviteMemberSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  role: Joi.string().valid('admin', 'member').default('member'),
});

const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'member').required(),
});

module.exports = {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
};
