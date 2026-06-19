const app = require('./app');
const config = require('./config');
const connectDatabase = require('./config/database');
const logger = require('./utils/logger');
const { createMailWorker } = require('./queues/mailQueue');
const { createWebhookWorker } = require('./queues/webhookQueue');
const emailService = require('./services/emailService');
const { Message } = require('./models');

let server;

const startServer = async () => {
  try {
    await connectDatabase();

    createMailWorker(emailService, Message);
    createWebhookWorker(require('./models/webhook'));

    logger.info('BullMQ workers initialized');

    server = app.listen(config.port, () => {
      logger.info(`
      ███╗   ███╗ █████╗ ██╗██╗     ███████╗███████╗██████╗ ██╗   ██╗██╗███████╗
      ████╗ ████║██╔══██╗██║██║     ██╔════╝██╔════╝██╔══██╗██║   ██║██║██╔════╝
      ██╔████╔██║███████║██║██║     ███████╗█████╗  ██████╔╝██║   ██║██║███████╗
      ██║╚██╔╝██║██╔══██║██║██║     ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██║╚════██║
      ██║ ╚═╝ ██║██║  ██║██║███████╗███████║███████╗██║  ██║ ╚████╔╝ ██║███████║
      ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝
      `);
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`API: http://localhost:${config.port}${config.apiPrefix}`);
      logger.info(`Swagger: http://localhost:${config.port}/api-docs`);
      logger.info(`Health: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  try {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (err) {
    logger.error('Error closing MongoDB connection:', err);
  }

  setTimeout(() => {
    logger.info('Graceful shutdown completed');
    process.exit(0);
  }, 3000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

startServer();
// Trigger nodemon reload to connect to running database and cache containers
