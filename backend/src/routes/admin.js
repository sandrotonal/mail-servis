const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.use(authorize('super_admin'));

router.get('/users', adminController.getUsers);
router.get('/workspaces', adminController.getWorkspaces);
router.get('/logs', adminController.getLogs);
router.get('/smtp-status', adminController.getSmtpStatus);
router.get('/stats', adminController.getStats);

module.exports = router;
