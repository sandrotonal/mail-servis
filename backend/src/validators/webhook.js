const Joi = require('joi');

const WEBHOOK_EVENTS = [
  'message.received',
  'message.sent',
  'message.failed',
  'project.created',
  'api_key.created',
];

const createWebhookSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  url: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  events: Joi.array().items(Joi.string().valid(...WEBHOOK_EVENTS)).min(1).required(),
  secret: Joi.string().min(8).max(128),
  isActive: Joi.boolean().default(true),
});

const updateWebhookSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  url: Joi.string().uri({ scheme: ['http', 'https'] }),
  events: Joi.array().items(Joi.string().valid(...WEBHOOK_EVENTS)).min(1),
  secret: Joi.string().min(8).max(128),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { createWebhookSchema, updateWebhookSchema };
