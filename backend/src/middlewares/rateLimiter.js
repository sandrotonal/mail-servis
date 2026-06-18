const rateLimit = require('express-rate-limit');
const config = require('../config');

const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.max || config.rateLimit.max,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
    ...options,
  });
};

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Too many API requests. Please slow down.',
  },
});

const formLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many form submissions. Please try again later.',
  },
});

module.exports = { createRateLimiter, authLimiter, apiLimiter, formLimiter };
