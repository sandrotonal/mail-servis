const BaseRepository = require('./base');
const { Submission } = require('../models');

class SubmissionRepository extends BaseRepository {
  constructor() {
    super(Submission);
  }

  async findByProject(projectId, options = {}) {
    return this.find({ project: projectId }, { sort: { createdAt: -1 }, ...options });
  }

  async findByWorkspace(workspaceId, options = {}) {
    return this.find({ workspace: workspaceId }, { sort: { createdAt: -1 }, ...options });
  }

  async markAsRead(submissionId) {
    return this.findByIdAndUpdate(submissionId, { isRead: true });
  }

  async getDailyStats(workspaceId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
      {
        $match: {
          workspace: workspaceId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          spam: { $sum: { $cond: [{ $eq: ['$isSpam', true] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

module.exports = new SubmissionRepository();
