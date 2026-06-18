const { Queue, QueueEvents, Worker } = require('bullmq');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

const connection = getRedisClient();

const webhookQueue = new Queue('webhook', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

const webhookQueueEvents = new QueueEvents('webhook', { connection });

const createWebhookWorker = (webhookModel) => {
  const worker = new Worker('webhook', async (job) => {
    const { workspaceId, projectId, event, payload } = job.data;

    try {
      const webhooks = await webhookModel.find({
        workspace: workspaceId,
        events: event,
        isActive: true,
      });

      for (const webhook of webhooks) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), webhook.timeout || 5000);

        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': webhook.secret,
              'X-Event': event,
            },
            body: JSON.stringify({
              event,
              timestamp: new Date().toISOString(),
              data: payload,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          webhook.lastTriggered = new Date();
          webhook.lastStatus = response.ok ? 'success' : 'failed';

          if (!response.ok) {
            logger.warn(`Webhook ${webhook._id} returned ${response.status}`);
            if (job.attemptsMade < webhook.retryCount) {
              throw new Error(`HTTP ${response.status}`);
            }
          }
        } catch (err) {
          clearTimeout(timeoutId);
          webhook.lastStatus = 'failed';
          logger.error(`Webhook ${webhook._id} failed:`, err.message);
          if (job.attemptsMade >= webhook.retryCount) {
            logger.error(`Webhook ${webhook._id} exhausted all retries`);
          } else {
            throw err;
          }
        }

        await webhook.save();
      }
    } catch (error) {
      logger.error(`Webhook worker error for job ${job.id}:`, error);
      throw error;
    }
  }, {
    connection,
    concurrency: 10,
  });

  worker.on('completed', (job) => {
    logger.debug(`Webhook worker completed job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Webhook worker failed job ${job.id}:`, err.message);
  });

  return worker;
};

module.exports = { webhookQueue, webhookQueueEvents, createWebhookWorker };
