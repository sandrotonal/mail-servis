const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const swaggerSetup = require('./utils/swagger');

const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspaces');
const projectRoutes = require('./routes/projects');
const formRoutes = require('./routes/forms');
const apiKeyRoutes = require('./routes/apiKeys');
const leadRoutes = require('./routes/leads');
const smtpRoutes = require('./routes/smtp');
const webhookRoutes = require('./routes/webhooks');
const domainRoutes = require('./routes/domains');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: [config.frontendUrl, ...(process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY', 'X-Webhook-Secret'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
}));

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.static(path.join(__dirname, '../public')));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use(globalRateLimit);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      logger.apiLog(req, res, duration);
    }
  });
  next();
});

swaggerSetup(app);

const { authenticate } = require('./middlewares/auth');
const { checkWorkspaceAccess } = require('./middlewares/workspaceAccess');

app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/workspaces`, workspaceRoutes);
app.use(`${config.apiPrefix}/workspaces/:workspaceId/projects`, authenticate, checkWorkspaceAccess(['owner', 'admin', 'member']), projectRoutes);
app.use(`${config.apiPrefix}/forms`, formRoutes);
app.use(`${config.apiPrefix}/workspaces/:workspaceId/api-keys`, authenticate, checkWorkspaceAccess(['owner', 'admin']), apiKeyRoutes);
app.use(`${config.apiPrefix}/workspaces/:workspaceId/leads`, authenticate, checkWorkspaceAccess(['owner', 'admin', 'member']), leadRoutes);
app.use(`${config.apiPrefix}/workspaces/:workspaceId/smtp`, authenticate, checkWorkspaceAccess(['owner', 'admin']), smtpRoutes);
app.use(`${config.apiPrefix}/workspaces/:workspaceId/webhooks`, authenticate, checkWorkspaceAccess(['owner', 'admin']), webhookRoutes);
app.use(`${config.apiPrefix}/workspaces/:workspaceId/domains`, authenticate, checkWorkspaceAccess(['owner', 'admin']), domainRoutes);
app.use(`${config.apiPrefix}/admin`, adminRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

app.use(errorHandler);

module.exports = app;
