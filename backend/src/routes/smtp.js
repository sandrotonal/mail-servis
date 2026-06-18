const router = require('express').Router({ mergeParams: true });
const smtpController = require('../controllers/smtpController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { smtpProviderSchema } = require('../validators/form');

router.use(authenticate);

router.get('/', smtpController.getAll);
router.post('/', validate(smtpProviderSchema), smtpController.create);
router.put('/:providerId', smtpController.update);
router.delete('/:providerId', smtpController.remove);
router.post('/:providerId/test', smtpController.test);

module.exports = router;
