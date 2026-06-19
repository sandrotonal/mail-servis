const router = require('express').Router({ mergeParams: true });
const webhookController = require('../controllers/webhookController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createWebhookSchema, updateWebhookSchema } = require('../validators/webhook');

router.use(authenticate);

router.get('/', webhookController.getAll);
router.post('/', validate(createWebhookSchema), webhookController.create);
router.get('/:webhookId', webhookController.getById);
router.put('/:webhookId', validate(updateWebhookSchema), webhookController.update);
router.delete('/:webhookId', webhookController.remove);
router.post('/:webhookId/test', webhookController.test);

module.exports = router;
