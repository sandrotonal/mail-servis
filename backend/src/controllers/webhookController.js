const { Webhook } = require('../models');
const crypto = require('crypto');
const { NotFoundError } = require('../utils/errors');
const asyncHandler = require('../middlewares/asyncHandler');
const logger = require('../utils/logger');

const create = asyncHandler(async (req, res) => {
  const secret = req.body.secret || crypto.randomBytes(24).toString('hex');
  const webhook = await Webhook.create({
    ...req.body,
    workspace: req.params.workspaceId,
    secret,
  });
  res.status(201).json({ success: true, data: { webhook } });
});

const getAll = asyncHandler(async (req, res) => {
  const webhooks = await Webhook.find({
    workspace: req.params.workspaceId,
  }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { webhooks } });
});

const getById = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.webhookId,
    workspace: req.params.workspaceId,
  });
  if (!webhook) throw new NotFoundError('Webhook not found.');
  res.status(200).json({ success: true, data: { webhook } });
});

const update = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOneAndUpdate(
    { _id: req.params.webhookId, workspace: req.params.workspaceId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!webhook) throw new NotFoundError('Webhook not found.');
  res.status(200).json({ success: true, data: { webhook } });
});

const remove = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOneAndDelete({
    _id: req.params.webhookId,
    workspace: req.params.workspaceId,
  });
  if (!webhook) throw new NotFoundError('Webhook not found.');
  res.status(200).json({ success: true, message: 'Webhook deleted.' });
});

// Test a webhook by sending a sample payload to its URL
const test = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.webhookId,
    workspace: req.params.workspaceId,
  });
  if (!webhook) throw new NotFoundError('Webhook not found.');

  const payload = {
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    data: { message: 'This is a test webhook delivery from MailServis.' },
  };

  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex');

  let status = 'success';
  let responseStatus = null;
  let error = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhook.secret,
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Event': 'webhook.test',
      },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    responseStatus = response.status;
    if (!response.ok) {
      status = 'failed';
      error = `HTTP ${response.status}`;
    }
  } catch (err) {
    status = 'failed';
    error = err.message;
    logger.warn('Webhook test delivery failed:', err.message);
  }

  // Save last delivery result on the webhook doc
  webhook.lastDeliveryAt = new Date();
  webhook.lastDeliveryStatus = status;
  await webhook.save();

  res.status(200).json({
    success: status === 'success',
    data: { status, responseStatus, error },
  });
});

module.exports = { create, getAll, getById, update, remove, test };
