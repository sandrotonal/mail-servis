const crypto = require('crypto');

const generateApiKey = () => {
  const prefix = 'ms_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const key = `${prefix}${randomBytes}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const lastFour = key.slice(-4);

  return { raw: key, hash, prefix, lastFour };
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const sanitizeHtml = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const parseUserAgent = (uaString) => {
  if (!uaString) return {};
  try {
    const UAParser = require('ua-parser-js');
    const parser = new UAParser(uaString);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();
    return {
      browser: `${browser.name || 'Unknown'} ${browser.version || ''}`.trim(),
      os: `${os.name || 'Unknown'} ${os.version || ''}`.trim(),
      device: device.type || 'desktop',
      vendor: device.vendor || '',
    };
  } catch {
    return {};
  }
};

const maskEmail = (email) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  const masked = name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  return `${masked}@${domain}`;
};

const asyncRetry = async (fn, maxAttempts = 3, delay = 1000) => {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }
  throw lastError;
};

module.exports = {
  generateApiKey,
  generateSlug,
  sanitizeHtml,
  parseUserAgent,
  maskEmail,
  asyncRetry,
};
