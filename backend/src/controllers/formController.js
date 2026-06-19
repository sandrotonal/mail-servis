const formService = require('../services/formService');
const projectRepository = require('../repositories/projectRepository');
const asyncHandler = require('../middlewares/asyncHandler');
const { NotFoundError } = require('../utils/errors');

const submitForm = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const metadata = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    referer: req.headers['referer'],
    country: req.headers['cf-ipcountry'],
  };

  const files = req.files?.map((f) => ({
    fieldName: f.fieldname,
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
    url: `/uploads/${f.filename}`,
    storageType: 'local',
  }));

  const result = await formService.processSubmission({
    projectId,
    formData: req.body,
    metadata,
    files,
  });

  const statusCode = result.blocked ? 200 : 201;
  res.status(statusCode).json({
    success: !result.blocked,
    ...result,
  });
});

const getSubmissions = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await projectRepository.findByProjectId(projectId);
  if (!project) throw new NotFoundError('Project not found.');

  const { WorkspaceMember } = require('../models');
  const membership = await WorkspaceMember.findOne({
    workspace: project.workspace,
    user: req.user._id,
    status: 'active',
  });

  if (!membership && req.user.role !== 'super_admin') {
    throw new NotFoundError('Project not found.');
  }

  const result = await formService.getSubmissions(projectId, req.query);
  res.status(200).json({
    success: true,
    data: result,
  });
});

const getSubmissionById = asyncHandler(async (req, res) => {
  const { Submission } = require('../models');
  const submission = await Submission.findById(req.params.submissionId)
    .populate('project', 'name projectId workspace');
  if (!submission) throw new NotFoundError('Submission not found.');

  const { WorkspaceMember } = require('../models');
  const membership = await WorkspaceMember.findOne({
    workspace: submission.project.workspace,
    user: req.user._id,
    status: 'active',
  });

  if (!membership && req.user.role !== 'super_admin') {
    throw new NotFoundError('Submission not found.');
  }

  res.status(200).json({
    success: true,
    data: { submission },
  });
});

const getProjectEmbed = asyncHandler(async (req, res) => {
  const project = await projectRepository.findByProjectId(req.params.projectId);
  if (!project) throw new NotFoundError('Project not found.');

  const endpoint = `${req.protocol}://${req.get('host')}/api/v1/forms/${project.projectId}/send`;
  const fields = project.fields || [];

  res.status(200).json({
    success: true,
    data: {
      project: {
        id: project.projectId,
        name: project.name,
        fields: project.fields,
        settings: project.settings,
      },
      embed: {
        iframe: `<iframe src="${req.protocol}://${req.get('host')}/embed/${project.projectId}" width="100%" height="600" frameborder="0"></iframe>`,
        javascript: `(function(){ var s=document.createElement('script'); s.src='${req.protocol}://${req.get('host')}/embed/${project.projectId}/js'; s.async=true; document.body.appendChild(s); })();`,
        endpoint,
        method: 'POST',
        headers: { 'X-API-KEY': 'YOUR_API_KEY', 'Content-Type': 'application/json' },
      },
      fields,
    },
  });
});

const deleteSubmission = asyncHandler(async (req, res) => {
  const { Submission, WorkspaceMember } = require('../models');
  const { ForbiddenError } = require('../utils/errors');
  const submission = await Submission.findById(req.params.submissionId)
    .populate('project', 'workspace');
  if (!submission) throw new NotFoundError('Submission not found.');

  const membership = await WorkspaceMember.findOne({
    workspace: submission.project.workspace,
    user: req.user._id,
    status: 'active',
  });

  if (!membership && req.user.role !== 'super_admin') {
    throw new NotFoundError('Submission not found.');
  }

  if (!['owner', 'admin'].includes(membership.role) && req.user.role !== 'super_admin') {
    throw new ForbiddenError('You do not have permission to delete submissions.');
  }

  await Submission.findByIdAndDelete(req.params.submissionId);

  res.status(200).json({
    success: true,
    message: 'Submission deleted successfully.',
  });
});

module.exports = { submitForm, getSubmissions, getSubmissionById, getProjectEmbed, deleteSubmission };
