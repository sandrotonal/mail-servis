const BaseRepository = require('./base');
const { Lead } = require('../models');

class LeadRepository extends BaseRepository {
  constructor() {
    super(Lead);
  }

  async findByWorkspace(workspaceId, options = {}) {
    return this.find({ workspace: workspaceId }, { sort: { createdAt: -1 }, ...options });
  }

  async findByEmailAndWorkspace(email, workspaceId) {
    return this.findOne({ email: email.toLowerCase(), workspace: workspaceId });
  }

  async findByStatus(workspaceId, status, options = {}) {
    return this.find({ workspace: workspaceId, status }, options);
  }

  async addNote(leadId, note) {
    return this.findByIdAndUpdate(leadId, {
      $push: { notes: note },
    });
  }

  async updateStatus(leadId, status) {
    const update = { status };
    if (status === 'won') update.convertedAt = new Date();
    return this.findByIdAndUpdate(leadId, update);
  }

  async getStatusCounts(workspaceId) {
    return this.aggregate([
      { $match: { workspace: workspaceId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }
}

module.exports = new LeadRepository();
