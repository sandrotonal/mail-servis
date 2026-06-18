const router = require('express').Router({ mergeParams: true });
const webhookController = require('../controllers/webhookController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { webhookSchema } = require('../validators/form');

router.use(authenticate);

router.get('/', webhookController.getAll);
router.post('/', validate(webhookSchema), webhookController.create);
router.put('/:webhookId', webhookController.update);
router.delete('/:webhookId', webhookController.remove);

module.exports = router;
