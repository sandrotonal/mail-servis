const { SmtpProvider } = require('../models');
const { NotFoundError } = require('../utils/errors');
const asyncHandler = require('../middlewares/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const provider = await SmtpProvider.create({
    ...req.body,
    workspace: req.params.workspaceId,
  });
  res.status(201).json({ success: true, data: { provider } });
});

const getAll = asyncHandler(async (req, res) => {
  const providers = await SmtpProvider.find({
    workspace: req.params.workspaceId,
    isActive: true,
  }).sort({ isPrimary: -1, failoverOrder: 1 });
  res.status(200).json({ success: true, data: { providers } });
});

const update = asyncHandler(async (req, res) => {
  const provider = await SmtpProvider.findOneAndUpdate(
    { _id: req.params.providerId, workspace: req.params.workspaceId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!provider) throw new NotFoundError('SMTP provider not found.');
  res.status(200).json({ success: true, data: { provider } });
});

const remove = asyncHandler(async (req, res) => {
  const provider = await SmtpProvider.findOneAndUpdate(
    { _id: req.params.providerId, workspace: req.params.workspaceId },
    { isActive: false },
    { new: true }
  );
  if (!provider) throw new NotFoundError('SMTP provider not found.');
  res.status(200).json({ success: true, message: 'Provider removed.' });
});

const test = asyncHandler(async (req, res) => {
  const provider = await SmtpProvider.findOne({
    _id: req.params.providerId,
    workspace: req.params.workspaceId,
  });
  if (!provider) throw new NotFoundError('SMTP provider not found.');

  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: provider.host,
    port: provider.port,
    secure: provider.secure,
    auth: { user: provider.username, pass: provider.password },
  });

  try {
    await transporter.verify();
    provider.isVerified = true;
    provider.lastTested = new Date();
    provider.lastTestResult = 'success';
    await provider.save();
    res.status(200).json({ success: true, message: 'SMTP connection successful.' });
  } catch (err) {
    provider.lastTested = new Date();
    provider.lastTestResult = `failed: ${err.message}`;
    await provider.save();
    res.status(200).json({ success: false, message: `SMTP test failed: ${err.message}` });
  }
});

const setDefault = asyncHandler(async (req, res) => {
  const workspaceId = req.params.workspaceId;
  // Unset all existing defaults for this workspace
  await SmtpProvider.updateMany({ workspace: workspaceId }, { isPrimary: false });
  const provider = await SmtpProvider.findOneAndUpdate(
    { _id: req.params.providerId, workspace: workspaceId },
    { isPrimary: true },
    { new: true }
  );
  if (!provider) throw new NotFoundError('SMTP provider not found.');
  res.status(200).json({ success: true, data: { provider } });
});

module.exports = { create, getAll, update, remove, test, setDefault };

