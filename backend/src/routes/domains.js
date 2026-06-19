const router = require('express').Router({ mergeParams: true });
const domainController = require('../controllers/domainController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/', domainController.listDomains);
router.post('/', domainController.addDomain);
router.post('/:domainId/verify', domainController.verifyDomain);
router.delete('/:domainId', domainController.removeDomain);

module.exports = router;
