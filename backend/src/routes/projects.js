const router = require('express').Router({ mergeParams: true });
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createProjectSchema, updateProjectSchema, formFieldSchema } = require('../validators/project');

router.use(authenticate);

router.get('/', projectController.getAll);
router.post('/', validate(createProjectSchema), projectController.create);
router.get('/:projectId', projectController.getById);
router.put('/:projectId', validate(updateProjectSchema), projectController.update);
router.delete('/:projectId', projectController.remove);
router.put('/:projectId/fields', validate(formFieldSchema), projectController.updateFields);

module.exports = router;
