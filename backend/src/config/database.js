const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/mail-servis', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('MongoDB connected successfully', { service: 'mail-servis' });
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    console.error('\n❌ MongoDB ÇALIŞMIYOR! Docker Desktop\'ı başlat:');
    console.error('   docker-compose up -d mongo redis\n');
    process.exit(1);
  }
};

module.exports = connectDatabase;
