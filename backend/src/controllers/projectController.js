const { projectRepository } = require('../repositories');
const { NotFoundError } = require('../utils/errors');
const asyncHandler = require('../middlewares/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const project = await projectRepository.create({
    ...req.body,
    workspace: req.params.workspaceId,
    createdBy: req.user._id,
  });
  res.status(201).json({
    success: true,
    data: { project },
  });
});

const getAll = asyncHandler(async (req, res) => {
  const projects = await projectRepository.findByWorkspace(req.params.workspaceId);
  res.status(200).json({
    success: true,
    data: { projects },
  });
});

const getById = asyncHandler(async (req, res) => {
  const project = await projectRepository.findById(req.params.projectId);
  if (!project) throw new NotFoundError('Project not found.');
  res.status(200).json({
    success: true,
    data: { project },
  });
});

const update = asyncHandler(async (req, res) => {
  const project = await projectRepository.findByIdAndUpdate(req.params.projectId, req.body);
  if (!project) throw new NotFoundError('Project not found.');
  res.status(200).json({
    success: true,
    data: { project },
  });
});

const remove = asyncHandler(async (req, res) => {
  const project = await projectRepository.findByIdAndDelete(req.params.projectId);
  if (!project) throw new NotFoundError('Project not found.');
  res.status(200).json({
    success: true,
    message: 'Project deleted successfully.',
  });
});

const updateFields = asyncHandler(async (req, res) => {
  const project = await projectRepository.findById(req.params.projectId);
  if (!project) throw new NotFoundError('Project not found.');
  project.fields = req.body.fields;
  await project.save();
  res.status(200).json({
    success: true,
    data: { project },
  });
});

module.exports = { create, getAll, getById, update, remove, updateFields };
