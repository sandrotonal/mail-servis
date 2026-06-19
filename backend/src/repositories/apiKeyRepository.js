const BaseRepository = require('./base');
const { ApiKey } = require('../models');

class ApiKeyRepository extends BaseRepository {
  constructor() {
    super(ApiKey);
  }

  async findByWorkspace(workspaceId) {
    return this.find({ workspace: workspaceId }, { sort: { createdAt: -1 } });
  }

  async findByKeyHash(keyHash) {
    return this.findOne({ keyHash });
  }
}

module.exports = new ApiKeyRepository();
