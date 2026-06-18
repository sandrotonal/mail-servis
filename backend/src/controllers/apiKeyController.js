const { ApiKey } = require('../models');
const { NotFoundError } = require('../utils/errors');
const { generateApiKey } = require('../utils/helpers');
const asyncHandler = require('../middlewares/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const { raw, hash, prefix, lastFour } = generateApiKey();

  const apiKey = await ApiKey.create({
    workspace: req.params.workspaceId,
    name: req.body.name,
    keyPrefix: prefix,
    keyHash: hash,
    keyLastFour: lastFour,
    createdBy: req.user._id,
    permissions: req.body.permissions,
    expiresAt: req.body.expiresAt,
  });

  res.status(201).json({
    success: true,
    message: 'API key generated successfully. Save this key now as it will not be shown again.',
    data: {
      apiKey: apiKey.toJSON(),
      rawKey: raw,
    },
  });
});

const getAll = asyncHandler(async (req, res) => {
  const apiKeys = await ApiKey.find({
    workspace: req.params.workspaceId,
    isActive: true,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { apiKeys },
  });
});

const remove = asyncHandler(async (req, res) => {
  const apiKey = await ApiKey.findOneAndUpdate(
    { _id: req.params.keyId, workspace: req.params.workspaceId },
    { isActive: false },
    { new: true }
  );
  if (!apiKey) throw new NotFoundError('API key not found.');
  res.status(200).json({
    success: true,
    message: 'API key revoked successfully.',
  });
});

const regenerate = asyncHandler(async (req, res) => {
  const { raw, hash, prefix, lastFour } = generateApiKey();

  const apiKey = await ApiKey.findOneAndUpdate(
    { _id: req.params.keyId, workspace: req.params.workspaceId },
    { keyHash: hash, keyPrefix: prefix, keyLastFour: lastFour },
    { new: true }
  );

  if (!apiKey) throw new NotFoundError('API key not found.');

  res.status(200).json({
    success: true,
    message: 'API key regenerated successfully.',
    data: {
      apiKey: apiKey.toJSON(),
      rawKey: raw,
    },
  });
});

module.exports = { create, getAll, remove, regenerate };
