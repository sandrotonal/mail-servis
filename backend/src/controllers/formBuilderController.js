const Form = require('../models/form');
const Project = require('../models/project');
const asyncHandler = require('../middlewares/asyncHandler');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');

exports.createForm = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description, fields, settings, styling } = req.body;

  const project = await Project.findById(projectId).populate('workspace');
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const form = await Form.create({
    project: projectId,
    workspace: project.workspace._id,
    name,
    description,
    fields: fields || [],
    settings: settings || {},
    styling: styling || {},
    createdBy: req.user._id
  });

  await form.populate('project', 'name');

  res.status(201).json({
    success: true,
    data: form
  });
});

exports.getForms = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;

  const project = await Project.findById(projectId);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  const filter = { project: projectId };
  
  if (status) {
    filter.status = status;
  }
  
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [forms, total] = await Promise.all([
    Form.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .lean(),
    Form.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: forms,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.getForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const form = await Form.findById(formId)
    .populate('project', 'name')
    .populate('createdBy', 'name email')
    .populate('settings.emailNotifications.template', 'name subject')
    .populate('settings.autoResponse.template', 'name subject');

  if (!form) {
    throw new NotFoundError('Form not found');
  }

  res.json({
    success: true,
    data: form
  });
});

exports.getFormPublic = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const form = await Form.findById(formId);

  if (!form) {
    throw new NotFoundError('Form not found');
  }

  if (form.status !== 'active') {
    throw new ForbiddenError('Form is not active');
  }

  await form.incrementViewCount();

  res.json({
    success: true,
    data: form.toPublicJSON()
  });
});

exports.updateForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const updates = req.body;

  const form = await Form.findById(formId);

  if (!form) {
    throw new NotFoundError('Form not found');
  }

  const allowedUpdates = ['name', 'description', 'fields', 'settings', 'styling', 'status'];
  const updateKeys = Object.keys(updates);
  
  const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
  
  if (!isValidUpdate) {
    throw new ValidationError('Invalid updates');
  }

  Object.assign(form, updates);
  form.updatedBy = req.user._id;
  
  await form.save();

  res.json({
    success: true,
    data: form
  });
});

exports.duplicateForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const originalForm = await Form.findById(formId);

  if (!originalForm) {
    throw new NotFoundError('Form not found');
  }

  const duplicateForm = await Form.create({
    project: originalForm.project,
    workspace: originalForm.workspace,
    name: `${originalForm.name} (Copy)`,
    description: originalForm.description,
    fields: originalForm.fields,
    settings: originalForm.settings,
    styling: originalForm.styling,
    status: 'draft',
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: duplicateForm
  });
});

exports.deleteForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const form = await Form.findById(formId);

  if (!form) {
    throw new NotFoundError('Form not found');
  }

  await form.deleteOne();

  res.json({
    success: true,
    message: 'Form deleted successfully'
  });
});

exports.updateFormStatus = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const { status } = req.body;

  const form = await Form.findById(formId);

  if (!form) {
    throw new NotFoundError('Form not found');
  }

  form.status = status;
  form.updatedBy = req.user._id;
  
  await form.save();

  res.json({
    success: true,
    data: form
  });
});

exports.getFormAnalytics = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const form = await Form.findById(formId);

  if (!form) {
    throw new NotFoundError('Form not found');
  }

  const analytics = {
    submissionCount: form.submissionCount,
    viewCount: form.viewCount,
    conversionRate: form.conversionRate,
    lastSubmissionAt: form.lastSubmissionAt,
    averageSubmissionsPerDay: await calculateAverageSubmissions(formId),
    fieldDropOffRate: await calculateFieldDropOffRate(formId)
  };

  res.json({
    success: true,
    data: analytics
  });
});

async function calculateAverageSubmissions(formId) {
  const form = await Form.findById(formId);
  const daysSinceCreation = Math.max(1, Math.floor((Date.now() - form.createdAt) / (1000 * 60 * 60 * 24)));
  return (form.submissionCount / daysSinceCreation).toFixed(2);
}

async function calculateFieldDropOffRate(formId) {
  return {};
}

module.exports = {
  createForm: exports.createForm,
  getForms: exports.getForms,
  getForm: exports.getForm,
  getFormPublic: exports.getFormPublic,
  updateForm: exports.updateForm,
  duplicateForm: exports.duplicateForm,
  deleteForm: exports.deleteForm,
  updateFormStatus: exports.updateFormStatus,
  getFormAnalytics: exports.getFormAnalytics
};
