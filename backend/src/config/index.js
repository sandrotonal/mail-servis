const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mail-servis',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-32chr!',

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  smtpFailover: {
    host: process.env.SMTP_FAILOVER_HOST,
    port: parseInt(process.env.SMTP_FAILOVER_PORT, 10) || 587,
    secure: process.env.SMTP_FAILOVER_SECURE === 'true',
    user: process.env.SMTP_FAILOVER_USER,
    pass: process.env.SMTP_FAILOVER_PASS,
  },

  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET,
    },
    cloudflare: {
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY,
      secretKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
      bucket: process.env.CLOUDFLARE_R2_BUCKET,
    },
    minio: {
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      bucket: process.env.MINIO_BUCKET || 'uploads',
    },
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
    dir: process.env.UPLOAD_DIR || './uploads',
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'image/png',
      'image/jpeg',
    ],
  },

  recaptcha: {
    secretKey: process.env.RECAPTCHA_SECRET_KEY,
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY,
  },

  plans: {
    free: { mailLimit: parseInt(process.env.FREE_MAIL_LIMIT, 10) || 100 },
    starter: { mailLimit: parseInt(process.env.STARTER_MAIL_LIMIT, 10) || 5000 },
    pro: { mailLimit: parseInt(process.env.PRO_MAIL_LIMIT, 10) || 50000 },
    business: { mailLimit: Infinity },
  },
};

module.exports = config;
