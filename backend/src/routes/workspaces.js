const router = require('express').Router({ mergeParams: true });
const workspaceController = require('../controllers/workspaceController');
const { authenticate } = require('../middlewares/auth');
const { checkWorkspaceAccess } = require('../middlewares/workspaceAccess');
const validate = require('../middlewares/validate');
const { createWorkspaceSchema, updateWorkspaceSchema, inviteMemberSchema, updateMemberRoleSchema } = require('../validators/workspace');

router.use(authenticate);

router.get('/stats', checkWorkspaceAccess(['owner', 'admin', 'member'], true), workspaceController.getStats);
router.get('/', workspaceController.getAll);
router.post('/', validate(createWorkspaceSchema), workspaceController.create);
router.get('/:workspaceId', checkWorkspaceAccess(['owner', 'admin', 'member']), workspaceController.getById);
router.put('/:workspaceId', checkWorkspaceAccess(['owner', 'admin']), validate(updateWorkspaceSchema), workspaceController.update);
router.delete('/:workspaceId', checkWorkspaceAccess(['owner']), workspaceController.remove);

router.get('/:workspaceId/members', checkWorkspaceAccess(['owner', 'admin', 'member']), workspaceController.getMembers);
router.post('/:workspaceId/members', checkWorkspaceAccess(['owner', 'admin']), validate(inviteMemberSchema), workspaceController.inviteMember);
router.put('/:workspaceId/members/:memberId', checkWorkspaceAccess(['owner', 'admin']), validate(updateMemberRoleSchema), workspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:memberId', checkWorkspaceAccess(['owner', 'admin']), workspaceController.removeMember);

router.put('/invites/:memberId/accept', workspaceController.acceptInvite);

module.exports = router;
