const { mailQueue, mailQueueEvents } = require('./mailQueue');
const { webhookQueue, webhookQueueEvents } = require('./webhookQueue');

module.exports = {
  mailQueue,
  mailQueueEvents,
  webhookQueue,
  webhookQueueEvents,
};
