const config = require('../config');
const { AppError } = require('../utils/errors');
const asyncHandler = require('./asyncHandler');

const checkPlanLimit = (resource = 'mail') => {
  return asyncHandler(async (req, res, next) => {
    const workspace = req.workspace;
    const plan = workspace.plan || 'free';
    const planLimits = config.plans[plan];

    if (!planLimits) {
      throw new AppError('Invalid plan configuration.', 500);
    }

    if (resource === 'mail' && workspace.monthlyUsage >= planLimits.mailLimit) {
      throw new AppError(
        `Monthly mail limit reached for your ${plan} plan (${planLimits.mailLimit} mails/month). Please upgrade your plan.`,
        429
      );
    }

    next();
  });
};

module.exports = { checkPlanLimit };
