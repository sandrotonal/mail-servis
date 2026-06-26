const EmailTemplate = require('../models/emailTemplate');
const emailTemplateService = require('../services/emailTemplateService');
const asyncHandler = require('../middlewares/asyncHandler');
const { NotFoundError, ValidationError } = require('../utils/errors');

exports.createTemplate = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { name, slug, description, subject, htmlContent, textContent, variables, category } = req.body;

  const existingTemplate = await EmailTemplate.findOne({ workspace: workspaceId, slug });
  
  if (existingTemplate) {
    throw new ValidationError('Template with this slug already exists');
  }

  const template = await EmailTemplate.create({
    workspace: workspaceId,
    name,
    slug,
    description,
    subject,
    htmlContent,
    textContent,
    variables,
    category,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: template
  });
});

exports.getTemplates = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { category, status, search } = req.query;

  const filter = { workspace: workspaceId };
  
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const templates = await EmailTemplate.find(filter)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email')
    .lean();

  res.json({
    success: true,
    data: templates
  });
});

exports.getTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;

  const template = await EmailTemplate.findById(templateId)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!template) {
    throw new NotFoundError('Template not found');
  }

  res.json({
    success: true,
    data: template
  });
});

exports.updateTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const updates = req.body;

  const template = await EmailTemplate.findById(templateId);

  if (!template) {
    throw new NotFoundError('Template not found');
  }

  if (template.isSystem) {
    throw new ValidationError('Cannot modify system templates');
  }

  const allowedUpdates = ['name', 'description', 'subject', 'htmlContent', 'textContent', 'variables', 'category', 'status'];
  const updateKeys = Object.keys(updates);
  
  const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
  
  if (!isValidUpdate) {
    throw new ValidationError('Invalid updates');
  }

  Object.assign(template, updates);
  template.updatedBy = req.user._id;
  
  await template.save();

  res.json({
    success: true,
    data: template
  });
});

exports.deleteTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;

  const template = await EmailTemplate.findById(templateId);

  if (!template) {
    throw new NotFoundError('Template not found');
  }

  if (template.isSystem) {
    throw new ValidationError('Cannot delete system templates');
  }

  await template.deleteOne();

  res.json({
    success: true,
    message: 'Template deleted successfully'
  });
});

exports.previewTemplate = asyncHandler(async (req, res) => {
  const { subject, htmlContent, previewData } = req.body;

  const preview = await emailTemplateService.previewTemplate(
    { subject, htmlContent },
    previewData || {}
  );

  res.json({
    success: true,
    data: preview
  });
});

exports.duplicateTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;

  const original = await EmailTemplate.findById(templateId);

  if (!original) {
    throw new NotFoundError('Template not found');
  }

  const duplicate = await EmailTemplate.create({
    workspace: original.workspace,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Date.now()}`,
    description: original.description,
    subject: original.subject,
    htmlContent: original.htmlContent,
    textContent: original.textContent,
    variables: original.variables,
    category: original.category,
    status: 'draft',
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: duplicate
  });
});

exports.createDefaultTemplates = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const count = await emailTemplateService.createDefaultTemplates(workspaceId, req.user._id);

  res.json({
    success: true,
    message: `${count} default templates created`,
    count
  });
});

module.exports = {
  createTemplate: exports.createTemplate,
  getTemplates: exports.getTemplates,
  getTemplate: exports.getTemplate,
  updateTemplate: exports.updateTemplate,
  deleteTemplate: exports.deleteTemplate,
  previewTemplate: exports.previewTemplate,
  duplicateTemplate: exports.duplicateTemplate,
  createDefaultTemplates: exports.createDefaultTemplates
};
