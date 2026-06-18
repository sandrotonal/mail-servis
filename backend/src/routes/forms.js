const router = require('express').Router({ mergeParams: true });
const formController = require('../controllers/formController');
const apiKeyAuth = require('../middlewares/apiKeyAuth');
const { authenticate } = require('../middlewares/auth');
const { formLimiter } = require('../middlewares/rateLimiter');
const upload = require('../middlewares/upload');

router.post('/:projectId/send',
  formLimiter,
  apiKeyAuth,
  upload.array('files'),
  formController.submitForm
);

router.get('/:projectId/submissions', authenticate, formController.getSubmissions);
router.get('/:projectId/submissions/:submissionId', authenticate, formController.getSubmissionById);
router.get('/:projectId/embed', formController.getProjectEmbed);

module.exports = router;
