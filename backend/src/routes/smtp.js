const router = require('express').Router({ mergeParams: true });
const smtpController = require('../controllers/smtpController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createSmtpSchema, updateSmtpSchema } = require('../validators/smtp');

router.use(authenticate);

router.get('/', smtpController.getAll);
router.post('/', validate(createSmtpSchema), smtpController.create);
router.put('/:providerId', validate(updateSmtpSchema), smtpController.update);
router.delete('/:providerId', smtpController.remove);
router.post('/:providerId/test', smtpController.test);
router.patch('/:providerId/default', smtpController.setDefault);

module.exports = router;
