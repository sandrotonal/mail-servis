const router = require('express').Router({ mergeParams: true });
const leadController = require('../controllers/leadController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', leadController.getAll);
router.get('/stats', leadController.getStats);
router.get('/:leadId', leadController.getById);
router.put('/:leadId/status', leadController.updateStatus);
router.post('/:leadId/notes', leadController.addNote);

module.exports = router;
