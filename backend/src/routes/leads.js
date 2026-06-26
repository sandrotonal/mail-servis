const router = require('express').Router({ mergeParams: true });
const leadController = require('../controllers/leadController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', leadController.getAll);
router.get('/stats', leadController.getStats);
router.get('/:leadId', leadController.getById);
router.put('/:leadId/status', leadController.updateStatus);
router.post('/:leadId/notes', leadController.addNote);
router.put('/:leadId/assign', leadController.assignLead);
router.put('/:leadId/priority', leadController.updatePriority);
router.put('/:leadId/follow-up', leadController.setFollowUp);

module.exports = router;
