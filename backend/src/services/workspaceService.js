const { workspaceRepository } = require('../repositories');
const { WorkspaceMember, User } = require('../models');
const { AppError, NotFoundError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

class WorkspaceService {
  async create({ name, settings, ownerId }) {
    const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    const existing = await workspaceRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError('Workspace with this name already exists.');
    }

    const workspace = await workspaceRepository.create({ name, slug, owner: ownerId, settings });

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: ownerId,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
    });

    return workspace;
  }

  async getById(workspaceId) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw new NotFoundError('Workspace not found.');
    return workspace;
  }

  async update(workspaceId, data) {
    const workspace = await workspaceRepository.findByIdAndUpdate(workspaceId, data);
    if (!workspace) throw new NotFoundError('Workspace not found.');
    return workspace;
  }

  async delete(workspaceId) {
    const workspace = await workspaceRepository.findByIdAndDelete(workspaceId);
    if (!workspace) throw new NotFoundError('Workspace not found.');
    await WorkspaceMember.deleteMany({ workspace: workspaceId });
    return { message: 'Workspace deleted successfully.' };
  }

  async getUserWorkspaces(userId) {
    const memberships = await WorkspaceMember.find({
      user: userId,
      status: 'active',
    }).populate('workspace');

    return memberships
      .filter((m) => m.workspace && m.workspace.isActive)
      .map((m) => ({
        ...m.workspace.toJSON(),
        role: m.role,
        membershipId: m._id,
      }));
  }

  async inviteMember(workspaceId, inviterId, { email, role }) {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) throw new NotFoundError('Workspace not found.');

    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      throw new NotFoundError('User with this email does not have an account.');
    }

    const existingMember = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: invitedUser._id,
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new ConflictError('User is already a member of this workspace.');
      }
      if (existingMember.status === 'pending') {
        return existingMember;
      }
      existingMember.status = 'pending';
      existingMember.role = role;
      existingMember.invitedBy = inviterId;
      await existingMember.save();
      return existingMember;
    }

    return WorkspaceMember.create({
      workspace: workspaceId,
      user: invitedUser._id,
      role,
      invitedBy: inviterId,
      status: 'pending',
    });
  }

  async getMembers(workspaceId) {
    const members = await WorkspaceMember.find({ workspace: workspaceId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: 1 });

    return members
      .filter((m) => m.user)
      .map((m) => ({
        _id: m._id,
        userId: m.user._id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt,
      }));
  }

  async updateMemberRole(workspaceId, memberId, newRole) {
    const member = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId });
    if (!member) throw new NotFoundError('Member not found.');
    if (member.role === 'owner') {
      throw new AppError('Cannot change the owner role.', 400);
    }
    member.role = newRole;
    await member.save();
    return member;
  }

  async removeMember(workspaceId, memberId) {
    const member = await WorkspaceMember.findOne({ _id: memberId, workspace: workspaceId });
    if (!member) throw new NotFoundError('Member not found.');
    if (member.role === 'owner') {
      throw new AppError('Cannot remove the workspace owner.', 400);
    }
    member.status = 'removed';
    await member.save();
    return { message: 'Member removed successfully.' };
  }

  async acceptInvite(userId, memberId) {
    const member = await WorkspaceMember.findOne({ _id: memberId, user: userId, status: 'pending' });
    if (!member) throw new NotFoundError('Invitation not found.');
    member.status = 'active';
    member.joinedAt = new Date();
    await member.save();
    return member;
  }
}

module.exports = new WorkspaceService();
