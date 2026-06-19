const Joi = require('joi');

const createSmtpSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  host: Joi.string().hostname().required(),
  port: Joi.number().integer().min(1).max(65535).required(),
  secure: Joi.boolean().default(false),
  username: Joi.string().required(),
  password: Joi.string().required(),
  fromName: Joi.string().max(100),
  fromEmail: Joi.string().email(),
  isDefault: Joi.boolean().default(false),
});

const updateSmtpSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  host: Joi.string().hostname(),
  port: Joi.number().integer().min(1).max(65535),
  secure: Joi.boolean(),
  username: Joi.string(),
  password: Joi.string(),
  fromName: Joi.string().max(100),
  fromEmail: Joi.string().email(),
  isDefault: Joi.boolean(),
}).min(1);

module.exports = { createSmtpSchema, updateSmtpSchema };
