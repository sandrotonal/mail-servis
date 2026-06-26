const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplateController');
const { authenticate } = require('../middlewares/auth');

router.post(
  '/workspaces/:workspaceId/email-templates',
  authenticate,
  emailTemplateController.createTemplate
);

router.get(
  '/workspaces/:workspaceId/email-templates',
  authenticate,
  emailTemplateController.getTemplates
);

router.get(
  '/email-templates/:templateId',
  authenticate,
  emailTemplateController.getTemplate
);

router.put(
  '/email-templates/:templateId',
  authenticate,
  emailTemplateController.updateTemplate
);

router.delete(
  '/email-templates/:templateId',
  authenticate,
  emailTemplateController.deleteTemplate
);

router.post(
  '/email-templates/preview',
  authenticate,
  emailTemplateController.previewTemplate
);

router.post(
  '/email-templates/:templateId/duplicate',
  authenticate,
  emailTemplateController.duplicateTemplate
);

router.post(
  '/workspaces/:workspaceId/email-templates/defaults',
  authenticate,
  emailTemplateController.createDefaultTemplates
);

module.exports = router;
