const router = require('express').Router({ mergeParams: true });
const apiKeyController = require('../controllers/apiKeyController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { apiKeySchema } = require('../validators/form');

router.use(authenticate);

router.get('/', apiKeyController.getAll);
router.post('/', validate(apiKeySchema), apiKeyController.create);
router.delete('/:keyId', apiKeyController.remove);
router.post('/:keyId/regenerate', apiKeyController.regenerate);

module.exports = router;
