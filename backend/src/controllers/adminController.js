const { User, Workspace, Log, SmtpProvider } = require('../models');
const asyncHandler = require('../middlewares/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
});

const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find()
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { workspaces } });
});

const getLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.level) filter.level = req.query.level;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;

  const [logs, total] = await Promise.all([
    Log.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Log.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: { logs, pagination: { page, limit, total } },
  });
});

const getSmtpStatus = asyncHandler(async (req, res) => {
  const providers = await SmtpProvider.find()
    .populate('workspace', 'name')
    .sort({ updatedAt: -1 });
  res.status(200).json({ success: true, data: { providers } });
});

const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalWorkspaces,
    totalProviders,
    recentLogs,
  ] = await Promise.all([
    User.countDocuments(),
    Workspace.countDocuments({ isActive: true }),
    SmtpProvider.countDocuments({ isActive: true }),
    Log.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
  ]);

  res.status(200).json({
    success: true,
    data: { totalUsers, totalWorkspaces, totalProviders, last24hLogs: recentLogs },
  });
});

module.exports = { getUsers, getWorkspaces, getLogs, getSmtpStatus, getStats };
