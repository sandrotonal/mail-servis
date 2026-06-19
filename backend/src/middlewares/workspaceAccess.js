const { WorkspaceMember, Workspace } = require('../models');
const { AppError, ForbiddenError, NotFoundError } = require('../utils/errors');
const asyncHandler = require('./asyncHandler');

const checkWorkspaceAccess = (requiredRoles = ['owner', 'admin', 'member'], allowMissing = false) => {
  return asyncHandler(async (req, res, next) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

    if (!workspaceId) {
      if (allowMissing) {
        return next();
      }
      throw new AppError('Workspace ID is required.', 400);
    }

    // If req.user is super_admin, they bypass member checks but workspace must still exist
    if (req.user.role === 'super_admin') {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        throw new NotFoundError('Workspace not found.');
      }
      req.workspace = workspace;
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

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found.');
    }

    req.membership = membership;
    req.workspace = workspace;
    next();
  });
};

module.exports = { checkWorkspaceAccess };
