const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('../config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MailServis API - Enterprise Contact Form Platform',
      version: '1.0.0',
      description: 'Self-hosted SaaS contact form platform with advanced features',
      contact: {
        name: 'MailServis Support',
        email: 'support@mailservis.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-KEY',
          description: 'Enter your API key for form submissions',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['super_admin', 'workspace_owner', 'admin', 'member'] },
            plan: { type: 'string', enum: ['free', 'starter', 'pro', 'business'] },
            isEmailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Workspace: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            owner: { type: 'string' },
            settings: { type: 'object' },
            isActive: { type: 'boolean' },
            monthlyUsage: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            projectId: { type: 'string' },
            workspace: { type: 'string' },
            fields: { type: 'array', items: { type: 'object' } },
            settings: { type: 'object' },
            isActive: { type: 'boolean' },
            totalSubmissions: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Submission: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            project: { type: 'string' },
            formData: { type: 'object' },
            metadata: { type: 'object' },
            files: { type: 'array', items: { type: 'object' } },
            spamScore: { type: 'number' },
            isSpam: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] },
            notes: { type: 'array', items: { type: 'object' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Workspaces', description: 'Workspace management' },
      { name: 'Projects', description: 'Project management' },
      { name: 'Forms', description: 'Form submission endpoints' },
      { name: 'API Keys', description: 'API key management' },
      { name: 'Leads', description: 'Lead management (CRM)' },
      { name: 'SMTP', description: 'SMTP provider management' },
      { name: 'Webhooks', description: 'Webhook management' },
      { name: 'Admin', description: 'Admin panel endpoints' },
    ],
  },
  apis: [],
};

const paths = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, workspaceName: { type: 'string' } }, required: ['name', 'email', 'password'] } } } },
      responses: { 201: { description: 'User registered successfully' }, 409: { description: 'Email already exists' } },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } } },
      responses: { 200: { description: 'Login successful' }, 401: { description: 'Invalid credentials' } },
    },
  },
  '/auth/refresh-token': {
    post: { tags: ['Auth'], summary: 'Refresh access token', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } } } }, responses: { 200: { description: 'Token refreshed' } } },
  },
  '/auth/forgot-password': {
    post: { tags: ['Auth'], summary: 'Request password reset', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } }, required: ['email'] } } } }, responses: { 200: { description: 'Reset email sent if account exists' } } },
  },
  '/auth/reset-password': {
    post: { tags: ['Auth'], summary: 'Reset password with token', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, password: { type: 'string' } }, required: ['token', 'password'] } } } }, responses: { 200: { description: 'Password reset successfully' } } },
  },
  '/auth/me': {
    get: { tags: ['Auth'], summary: 'Get current user', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Current user data' } } },
  },
  '/workspaces': {
    get: { tags: ['Workspaces'], summary: 'Get all user workspaces', security: [{ bearerAuth: [] }], responses: { 200: { description: 'List of workspaces' } } },
    post: { tags: ['Workspaces'], summary: 'Create new workspace', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, settings: { type: 'object' } }, required: ['name'] } } } }, responses: { 201: { description: 'Workspace created' } } },
  },
  '/workspaces/{workspaceId}': {
    get: { tags: ['Workspaces'], summary: 'Get workspace by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Workspace data' } } },
    put: { tags: ['Workspaces'], summary: 'Update workspace', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Workspace updated' } } },
    delete: { tags: ['Workspaces'], summary: 'Delete workspace', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Workspace deleted' } } },
  },
  '/workspaces/{workspaceId}/members': {
    get: { tags: ['Workspaces'], summary: 'Get workspace members', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'List of members' } } },
    post: { tags: ['Workspaces'], summary: 'Invite member', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, role: { type: 'string', enum: ['admin', 'member'] } }, required: ['email'] } } } }, responses: { 201: { description: 'Invitation sent' } } },
  },
  '/workspaces/{workspaceId}/members/{memberId}': {
    put: { tags: ['Workspaces'], summary: 'Update member role', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'memberId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Role updated' } } },
    delete: { tags: ['Workspaces'], summary: 'Remove member', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'memberId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Member removed' } } },
  },
  '/workspaces/{workspaceId}/projects': {
    get: { tags: ['Projects'], summary: 'Get all projects', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'List of projects' } } },
    post: { tags: ['Projects'], summary: 'Create project', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } } } }, responses: { 201: { description: 'Project created' } } },
  },
  '/workspaces/{workspaceId}/projects/{projectId}': {
    get: { tags: ['Projects'], summary: 'Get project details', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Project data' } } },
    put: { tags: ['Projects'], summary: 'Update project', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Project updated' } } },
    delete: { tags: ['Projects'], summary: 'Delete project', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Project deleted' } } },
  },
  '/forms/{projectId}/send': {
    post: { tags: ['Forms'], summary: 'Submit form data', security: [{ apiKeyAuth: [] }], parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, subject: { type: 'string' }, message: { type: 'string' } }, required: ['email'] } } } }, responses: { 201: { description: 'Form submitted' } } },
  },
  '/workspaces/{workspaceId}/api-keys': {
    get: { tags: ['API Keys'], summary: 'List API keys', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'List of API keys' } } },
    post: { tags: ['API Keys'], summary: 'Create API key', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } } } }, responses: { 201: { description: 'API key created' } } },
  },
  '/workspaces/{workspaceId}/leads': {
    get: { tags: ['Leads'], summary: 'List leads', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'List of leads' } } },
  },
  '/workspaces/{workspaceId}/leads/stats': {
    get: { tags: ['Leads'], summary: 'Get lead statistics', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Lead stats' } } },
  },
  '/workspaces/{workspaceId}/leads/{leadId}': {
    put: { tags: ['Leads'], summary: 'Update lead status', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'leadId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Lead status updated' } } },
  },
  '/workspaces/{workspaceId}/smtp': {
    get: { tags: ['SMTP'], summary: 'List SMTP providers', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'List of SMTP providers' } } },
    post: { tags: ['SMTP'], summary: 'Add SMTP provider', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'SMTP provider added' } } },
  },
  '/workspaces/{workspaceId}/webhooks': {
    get: { tags: ['Webhooks'], summary: 'List webhooks', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'List of webhooks' } } },
    post: { tags: ['Webhooks'], summary: 'Create webhook', security: [{ bearerAuth: [] }], parameters: [{ name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Webhook created' } } },
  },
  '/admin/users': {
    get: { tags: ['Admin'], summary: 'List all users', security: [{ bearerAuth: [] }], responses: { 200: { description: 'List of users' } } },
  },
  '/admin/workspaces': {
    get: { tags: ['Admin'], summary: 'List all workspaces', security: [{ bearerAuth: [] }], responses: { 200: { description: 'List of workspaces' } } },
  },
  '/admin/logs': {
    get: { tags: ['Admin'], summary: 'View system logs', security: [{ bearerAuth: [] }], responses: { 200: { description: 'System logs' } } },
  },
  '/admin/stats': {
    get: { tags: ['Admin'], summary: 'System statistics', security: [{ bearerAuth: [] }], responses: { 200: { description: 'System stats' } } },
  },
};

const swaggerSpec = swaggerJsdoc(options);
swaggerSpec.paths = paths;

const swaggerSetup = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MailServis API Documentation',
  }));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = swaggerSetup;
