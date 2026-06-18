const router = require('express').Router({ mergeParams: true });
const workspaceController = require('../controllers/workspaceController');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createWorkspaceSchema, updateWorkspaceSchema, inviteMemberSchema, updateMemberRoleSchema } = require('../validators/workspace');

router.use(authenticate);

router.get('/', workspaceController.getAll);
router.post('/', validate(createWorkspaceSchema), workspaceController.create);
router.get('/:workspaceId', workspaceController.getById);
router.put('/:workspaceId', validate(updateWorkspaceSchema), workspaceController.update);
router.delete('/:workspaceId', workspaceController.remove);

router.get('/:workspaceId/members', workspaceController.getMembers);
router.post('/:workspaceId/members', validate(inviteMemberSchema), workspaceController.inviteMember);
router.put('/:workspaceId/members/:memberId', validate(updateMemberRoleSchema), workspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:memberId', workspaceController.removeMember);

router.put('/invites/:memberId/accept', workspaceController.acceptInvite);

module.exports = router;
