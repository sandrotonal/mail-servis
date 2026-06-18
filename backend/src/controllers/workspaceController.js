const workspaceService = require('../services/workspaceService');
const asyncHandler = require('../middlewares/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.create({
    ...req.body,
    ownerId: req.user._id,
  });
  res.status(201).json({
    success: true,
    data: { workspace },
  });
});

const getAll = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.getUserWorkspaces(req.user._id);
  res.status(200).json({
    success: true,
    data: { workspaces },
  });
});

const getById = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getById(req.params.workspaceId);
  res.status(200).json({
    success: true,
    data: { workspace },
  });
});

const update = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.update(req.params.workspaceId, req.body);
  res.status(200).json({
    success: true,
    data: { workspace },
  });
});

const remove = asyncHandler(async (req, res) => {
  const result = await workspaceService.delete(req.params.workspaceId);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const inviteMember = asyncHandler(async (req, res) => {
  const member = await workspaceService.inviteMember(
    req.params.workspaceId,
    req.user._id,
    req.body
  );
  res.status(201).json({
    success: true,
    message: 'Invitation sent successfully.',
    data: { member },
  });
});

const getMembers = asyncHandler(async (req, res) => {
  const members = await workspaceService.getMembers(req.params.workspaceId);
  res.status(200).json({
    success: true,
    data: { members },
  });
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const member = await workspaceService.updateMemberRole(
    req.params.workspaceId,
    req.params.memberId,
    req.body.role
  );
  res.status(200).json({
    success: true,
    data: { member },
  });
});

const removeMember = asyncHandler(async (req, res) => {
  const result = await workspaceService.removeMember(
    req.params.workspaceId,
    req.params.memberId
  );
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const acceptInvite = asyncHandler(async (req, res) => {
  const member = await workspaceService.acceptInvite(req.user._id, req.params.memberId);
  res.status(200).json({
    success: true,
    data: { member },
  });
});

module.exports = {
  create, getAll, getById, update, remove,
  inviteMember, getMembers, updateMemberRole, removeMember, acceptInvite,
};
