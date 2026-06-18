const { WorkspaceMember } = require('../models');
const { AppError, ForbiddenError } = require('../utils/errors');
const asyncHandler = require('./asyncHandler');

const checkWorkspaceAccess = (requiredRoles = ['owner', 'admin', 'member']) => {
  return asyncHandler(async (req, res, next) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!workspaceId) {
      throw new AppError('Workspace ID is required.', 400);
    }

    if (req.user.role === 'super_admin') {
      return next();
    }

    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: req.user._id,
      status: 'active',
    });

    if (!membership) {
      throw new ForbiddenError('You do not have access to this workspace.');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenError('You do not have sufficient permissions in this workspace.');
    }

    req.membership = membership;
    next();
  });
};

module.exports = { checkWorkspaceAccess };
