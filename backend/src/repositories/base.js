class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id, options = {}) {
    return this.model.findById(id, options.projection, options);
  }

  async findOne(filter, options = {}) {
    return this.model.findOne(filter, options.projection, options);
  }

  async find(filter = {}, options = {}) {
    const query = this.model.find(filter, options.projection, options);

    if (options.sort) query.sort(options.sort);
    if (options.limit) query.limit(options.limit);
    if (options.skip) query.skip(options.skip);
    if (options.populate) query.populate(options.populate);

    return query.exec();
  }

  async findByIdAndUpdate(id, data, options = {}) {
    return this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async findOneAndUpdate(filter, data, options = {}) {
    return this.model.findOneAndUpdate(filter, data, {
      new: true,
      runValidators: true,
      ...options,
    });
  }

  async findByIdAndDelete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async deleteMany(filter) {
    return this.model.deleteMany(filter);
  }

  async countDocuments(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async paginate(filter = {}, options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.find(filter, {
        ...options,
        skip,
        limit,
      }),
      this.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }
}

module.exports = BaseRepository;
