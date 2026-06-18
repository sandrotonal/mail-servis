const crypto = require('crypto');
const { ApiKey } = require('../models');
const { AppError } = require('../utils/errors');
const asyncHandler = require('./asyncHandler');

const apiKeyAuth = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    throw new AppError('API key is required. Provide it via X-API-KEY header.', 401);
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const keyRecord = await ApiKey.findOne({
    keyHash,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ],
  }).populate('workspace');

  if (!keyRecord) {
    throw new AppError('Invalid or expired API key.', 401);
  }

  keyRecord.lastUsed = new Date();
  await keyRecord.save();

  req.apiKey = keyRecord;
  req.workspace = keyRecord.workspace;
  next();
});

module.exports = apiKeyAuth;
