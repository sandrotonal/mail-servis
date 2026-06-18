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
  const lead = await leadRepository.findById(req.params.leadId)
    .populate('assignedTo', 'name email')
    .populate('notes.addedBy', 'name');
  if (!lead) throw new NotFoundError('Lead not found.');
  res.status(200).json({ success: true, data: { lead } });
});

const updateStatus = asyncHandler(async (req, res) => {
  const lead = await leadRepository.updateStatus(req.params.leadId, req.body.status);
  if (!lead) throw new NotFoundError('Lead not found.');
  res.status(200).json({ success: true, data: { lead } });
});

const addNote = asyncHandler(async (req, res) => {
  const note = {
    content: req.body.content,
    addedBy: req.user._id,
  };
  const lead = await leadRepository.addNote(req.params.leadId, note);
  if (!lead) throw new NotFoundError('Lead not found.');
  res.status(200).json({ success: true, data: { lead } });
});

const getStats = asyncHandler(async (req, res) => {
  const counts = await leadRepository.getStatusCounts(req.params.workspaceId);
  res.status(200).json({ success: true, data: { statusCounts: counts } });
});

module.exports = { getAll, getById, updateStatus, addNote, getStats };
