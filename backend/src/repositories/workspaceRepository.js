const BaseRepository = require('./base');
const { Workspace } = require('../models');

class WorkspaceRepository extends BaseRepository {
  constructor() {
    super(Workspace);
  }

  async findBySlug(slug) {
    return this.findOne({ slug: slug.toLowerCase() });
  }

  async findByOwner(ownerId, options = {}) {
    return this.find({ owner: ownerId, isActive: true }, options);
  }

  async incrementMonthlyUsage(workspaceId, amount = 1) {
    return this.findByIdAndUpdate(workspaceId, {
      $inc: { monthlyUsage: amount },
    });
  }

  async resetMonthlyUsage() {
    return this.model.updateMany({}, { $set: { monthlyUsage: 0 } });
  }
}

module.exports = new WorkspaceRepository();
