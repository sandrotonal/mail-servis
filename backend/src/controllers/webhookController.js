const { Webhook } = require('../models');
const crypto = require('crypto');
const { NotFoundError } = require('../utils/errors');
const asyncHandler = require('../middlewares/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const secret = crypto.randomBytes(24).toString('hex');
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

module.exports = { create, getAll, update, remove };
