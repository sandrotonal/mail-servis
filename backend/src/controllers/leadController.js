const { leadRepository } = require('../repositories');
const { NotFoundError } = require('../utils/errors');
const asyncHandler = require('../middlewares/asyncHandler');

const getAll = asyncHandler(async (req, res) => {
  const filter = { workspace: req.params.workspaceId };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { email: { $regex: req.query.search, $options: 'i' } },
      { name: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const result = await leadRepository.paginate(filter, req.query);
  res.status(200).json({ success: true, data: result });
});

const getById = asyncHandler(async (req, res) => {
  const lead = await leadRepository.findOne({ _id: req.params.leadId, workspace: req.params.workspaceId });
  if (!lead) throw new NotFoundError('Lead not found.');
  await lead.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'notes.addedBy', select: 'name' }
  ]);
  res.status(200).json({ success: true, data: { lead } });
});

const updateStatus = asyncHandler(async (req, res) => {
  const lead = await leadRepository.findOne({ _id: req.params.leadId, workspace: req.params.workspaceId });
  if (!lead) throw new NotFoundError('Lead not found.');
  const updatedLead = await leadRepository.updateStatus(lead._id, req.body.status);
  res.status(200).json({ success: true, data: { lead: updatedLead } });
});

const addNote = asyncHandler(async (req, res) => {
  const lead = await leadRepository.findOne({ _id: req.params.leadId, workspace: req.params.workspaceId });
  if (!lead) throw new NotFoundError('Lead not found.');

  const note = {
    content: req.body.content,
    addedBy: req.user._id,
  };
  const updatedLead = await leadRepository.addNote(lead._id, note);
  res.status(200).json({ success: true, data: { lead: updatedLead } });
});

const getStats = asyncHandler(async (req, res) => {
  const counts = await leadRepository.getStatusCounts(req.params.workspaceId);
  res.status(200).json({ success: true, data: { statusCounts: counts } });
});

const assignLead = asyncHandler(async (req, res) => {
  const lead = await leadRepository.findOne({ _id: req.params.leadId, workspace: req.params.workspaceId });
  if (!lead) throw new NotFoundError('Lead not found.');
  
  lead.assignedTo = req.body.userId;
  lead.assignedAt = new Date();
  
  if (!lead.activities) lead.activities = [];
  lead.activities.push({
    type: 'assigned',
    description: 'Lead assigned',
    performedBy: req.user._id,
    metadata: { assignedTo: req.body.userId }
  });
  
  await lead.save();
  
  res.status(200).json({ success: true, data: lead });
});

const updatePriority = asyncHandler(async (req, res) => {
  const lead = await leadRepository.findOne({ _id: req.params.leadId, workspace: req.params.workspaceId });
  if (!lead) throw new NotFoundError('Lead not found.');
  
  lead.priority = req.body.priority;
  await lead.save();
  
  res.status(200).json({ success: true, data: lead });
});

const setFollowUp = asyncHandler(async (req, res) => {
  const lead = await leadRepository.findOne({ _id: req.params.leadId, workspace: req.params.workspaceId });
  if (!lead) throw new NotFoundError('Lead not found.');
  
  lead.nextFollowUp = new Date(req.body.date);
  await lead.save();
  
  res.status(200).json({ success: true, data: lead });
});

module.exports = { 
  getAll, 
  getById, 
  updateStatus, 
  addNote, 
  getStats, 
  assignLead, 
  updatePriority, 
  setFollowUp 
};
