const { Queue, QueueEvents, Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const config = require('../config');
const logger = require('../utils/logger');

const connection = getRedisClient();

const mailQueue = new Queue('mail', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

const mailQueueEvents = new QueueEvents('mail', { connection });

mailQueueEvents.on('completed', ({ jobId }) => {
  logger.debug(`Mail job ${jobId} completed`);
});

mailQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Mail job ${jobId} failed:`, failedReason);
});

const createMailWorker = (emailService, messageModel) => {
  const worker = new Worker('mail', async (job) => {
    const { project, submission, formData, files, provider } = job.data;

    try {
      const message = await messageModel.create({
        workspace: project.workspace,
        project: project._id,
        submission: submission._id,
        to: project.settings.defaultFromEmail || config.smtp.user,
        from: project.settings.defaultFromName
          ? `${project.settings.defaultFromName} <${project.settings.defaultFromEmail || config.smtp.user}>`
          : config.smtp.user,
        subject: formData.subject || `New message from ${formData.name || 'unknown'}`,
        status: 'queued',
        maxAttempts: 3,
      });

      const result = await emailService.sendFormNotification({
        to: project.settings.defaultFromEmail || config.smtp.user,
        from: project.settings.defaultFromName
          ? `${project.settings.defaultFromName} <${project.settings.defaultFromEmail || config.smtp.user}>`
          : config.smtp.user,
        subject: formData.subject || `New message from ${formData.name || 'unknown'}`,
        formData,
        project,
        files,
      });

      if (result.success) {
        message.status = 'sent';
        message.sentAt = new Date();
        message.metadata = {
          messageId: result.messageId,
          response: result.response,
        };
        await message.save();
        logger.info(`Email sent successfully for submission ${submission._id}`);
      } else {
        message.status = 'failed';
        message.lastError = result.error;
        await message.save();

        if (job.attemptsMade < (job.opts?.attempts || 3)) {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      logger.error(`Mail worker error for job ${job.id}:`, error);
      throw error;
    }
  }, {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  });

  worker.on('completed', (job) => {
    logger.debug(`Mail worker completed job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Mail worker failed job ${job.id}:`, err.message);
  });

  return worker;
};

module.exports = { mailQueue, mailQueueEvents, createMailWorker };
