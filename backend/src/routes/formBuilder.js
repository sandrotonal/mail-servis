const express = require('express');
const router = express.Router();
const formBuilderController = require('../controllers/formBuilderController');
const { authenticate } = require('../middlewares/auth');

router.post(
  '/projects/:projectId/forms',
  authenticate,
  formBuilderController.createForm
);

router.get(
  '/projects/:projectId/forms',
  authenticate,
  formBuilderController.getForms
);

router.get(
  '/forms/:formId',
  authenticate,
  formBuilderController.getForm
);

router.get(
  '/forms/:formId/public',
  formBuilderController.getFormPublic
);

router.put(
  '/forms/:formId',
  authenticate,
  formBuilderController.updateForm
);

router.post(
  '/forms/:formId/duplicate',
  authenticate,
  formBuilderController.duplicateForm
);

router.delete(
  '/forms/:formId',
  authenticate,
  formBuilderController.deleteForm
);

router.patch(
  '/forms/:formId/status',
  authenticate,
  formBuilderController.updateFormStatus
);

router.get(
  '/forms/:formId/analytics',
  authenticate,
  formBuilderController.getFormAnalytics
);

module.exports = router;
