const { projectRepository, submissionRepository, leadRepository, workspaceRepository } = require('../repositories');
const { Submission, Lead, Message, Webhook } = require('../models');
const spamService = require('./spamService');
const emailService = require('./emailService');
const { mailQueue } = require('../queues/mailQueue');
const { webhookQueue } = require('../queues/webhookQueue');
const logger = require('../utils/logger');
const { AppError, NotFoundError } = require('../utils/errors');

class FormService {
  async processSubmission({ projectId, formData, metadata, files }) {
    const project = await projectRepository.findByProjectId(projectId);
    if (!project || !project.isActive) {
      throw new NotFoundError('Project not found or inactive.');
    }

    if (project.settings.spamProtection) {
      const spamResult = spamService.calculateSpamScore(formData, metadata);
      if (spamResult.isSpam) {
        await this._saveSubmission(project, formData, metadata, files, spamResult);
        logger.warn('Spam submission blocked', { projectId, score: spamResult.score });
        return { blocked: true, reason: 'Spam detected', score: spamResult.score };
      }
    }

    const submission = await this._saveSubmission(project, formData, metadata, files);

    const lead = await this._createOrUpdateLead(project, formData, submission);

    await projectRepository.incrementSubmissions(project._id);
    await workspaceRepository.incrementMonthlyUsage(project.workspace);

    await mailQueue.add('send-form-email', {
      project: project.toJSON(),
      submission: submission.toJSON(),
      formData,
      files,
    });

    await this._triggerWebhooks(project.workspace, project._id, 'message.received', {
      submission: submission.toJSON(),
      lead: lead?.toJSON(),
    });

    return {
      success: true,
      message: project.settings.successMessage || 'Thank you! Your message has been sent successfully.',
      submissionId: submission._id,
      redirectUrl: project.settings.redirectUrl || undefined,
    };
  }

  async _saveSubmission(project, formData, metadata, files, spamResult) {
    return submissionRepository.create({
      project: project._id,
      workspace: project.workspace,
      formData,
      metadata: {
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
        referer: metadata?.referer,
        country: metadata?.country,
      },
      files: files || [],
      spamScore: spamResult?.score || 0,
      isSpam: spamResult?.isSpam || false,
    });
  }

  async _createOrUpdateLead(project, formData, submission) {
    const email = formData.email;
    if (!email) return null;

    const workspaceId = project.workspace;
    let lead = await leadRepository.findByEmailAndWorkspace(email, workspaceId);

    if (lead) {
      lead.lastSubmission = new Date();
      lead.submission = submission._id;
      await lead.save();
    } else {
      lead = await leadRepository.create({
        workspace: workspaceId,
        project: project._id,
        submission: submission._id,
        email,
        name: formData.name,
        phone: formData.phone,
        source: 'form',
        customFields: { ...formData, email: undefined, name: undefined, phone: undefined },
      });
    }

    return lead;
  }

  async _triggerWebhooks(workspaceId, projectId, event, payload) {
    try {
      await webhookQueue.add('trigger-webhook', {
        workspaceId,
        projectId,
        event,
        payload,
      });
    } catch (err) {
      logger.error('Failed to queue webhook:', err);
    }
  }

  async getSubmissions(projectId, options = {}) {
    const project = await projectRepository.findByProjectId(projectId);
    if (!project) throw new NotFoundError('Project not found');
    return submissionRepository.paginate({ project: project._id }, options);
  }

  async getSubmissionStats(workspaceId) {
    const [totalSubmissions, totalLeads, recentSubmissions, statusCounts] = await Promise.all([
      submissionRepository.countDocuments({ workspace: workspaceId }),
      leadRepository.countDocuments({ workspace: workspaceId }),
      submissionRepository.getDailyStats(workspaceId, 30),
      leadRepository.getStatusCounts(workspaceId),
    ]);

    return {
      totalSubmissions,
      totalLeads,
      dailyStats: recentSubmissions,
      leadStatusCounts: statusCounts,
    };
  }
}

module.exports = new FormService();
