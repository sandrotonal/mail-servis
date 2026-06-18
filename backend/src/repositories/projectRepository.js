const BaseRepository = require('./base');
const { Project } = require('../models');

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  async findByProjectId(projectId) {
    return this.findOne({ projectId });
  }

  async findByWorkspace(workspaceId, options = {}) {
    return this.find({ workspace: workspaceId, isActive: true }, options);
  }

  async incrementSubmissions(projectId) {
    return this.findByIdAndUpdate(projectId, {
      $inc: { totalSubmissions: 1 },
    });
  }
}

module.exports = new ProjectRepository();
