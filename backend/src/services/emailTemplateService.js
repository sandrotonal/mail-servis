const Handlebars = require('handlebars');
const EmailTemplate = require('../models/emailTemplate');
const { NotFoundError } = require('../utils/errors');

class EmailTemplateService {
  constructor() {
    this.registerHelpers();
  }

  registerHelpers() {
    Handlebars.registerHelper('formatDate', (date, format) => {
      if (!date) return '';
      const d = new Date(date);
      if (format === 'short') {
        return d.toLocaleDateString();
      }
      return d.toLocaleString();
    });

    Handlebars.registerHelper('uppercase', (str) => {
      return str ? str.toUpperCase() : '';
    });

    Handlebars.registerHelper('lowercase', (str) => {
      return str ? str.toLowerCase() : '';
    });

    Handlebars.registerHelper('truncate', (str, length) => {
      if (!str) return '';
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    });

    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
      return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('formatCurrency', (amount, currency = 'USD') => {
      if (!amount) return '0.00';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    });

    Handlebars.registerHelper('json', (context) => {
      return JSON.stringify(context, null, 2);
    });
  }

  async renderTemplate(templateId, data) {
    const template = await EmailTemplate.findById(templateId);
    
    if (!template) {
      throw new NotFoundError('Email template not found');
    }

    if (template.status !== 'active') {
      throw new Error('Template is not active');
    }

    const missingRequired = this.validateRequiredVariables(template, data);
    if (missingRequired.length > 0) {
      throw new Error(`Missing required variables: ${missingRequired.join(', ')}`);
    }

    const enrichedData = this.enrichData(template, data);

    try {
      const subjectTemplate = Handlebars.compile(template.subject);
      const htmlTemplate = Handlebars.compile(template.htmlContent);
      const textTemplate = template.textContent 
        ? Handlebars.compile(template.textContent)
        : null;

      const rendered = {
        subject: subjectTemplate(enrichedData),
        html: htmlTemplate(enrichedData),
        text: textTemplate ? textTemplate(enrichedData) : this.htmlToText(htmlTemplate(enrichedData))
      };

      await template.incrementUsage();

      return rendered;
    } catch (error) {
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  validateRequiredVariables(template, data) {
    const missing = [];
    
    if (template.variables) {
      for (const variable of template.variables) {
        if (variable.required && !data[variable.name]) {
          missing.push(variable.name);
        }
      }
    }

    return missing;
  }

  enrichData(template, data) {
    const enriched = { ...data };

    if (template.variables) {
      for (const variable of template.variables) {
        if (!enriched[variable.name] && variable.defaultValue) {
          enriched[variable.name] = variable.defaultValue;
        }
      }
    }

    enriched._meta = {
      templateName: template.name,
      generatedAt: new Date().toISOString()
    };

    return enriched;
  }

  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async renderTemplateBySlug(workspaceId, slug, data) {
    const template = await EmailTemplate.findOne({
      workspace: workspaceId,
      slug: slug,
      status: 'active'
    });

    if (!template) {
      throw new NotFoundError(`Template with slug '${slug}' not found`);
    }

    return this.renderTemplate(template._id, data);
  }

  async createDefaultTemplates(workspaceId, userId) {
    const defaults = EmailTemplate.getDefaultTemplates();
    
    const templates = defaults.map(tpl => ({
      ...tpl,
      workspace: workspaceId,
      createdBy: userId,
      status: 'active'
    }));

    await EmailTemplate.insertMany(templates);
    
    return templates.length;
  }

  async previewTemplate(templateContent, data) {
    try {
      const subjectTemplate = Handlebars.compile(templateContent.subject);
      const htmlTemplate = Handlebars.compile(templateContent.htmlContent);
      
      return {
        subject: subjectTemplate(data),
        html: htmlTemplate(data)
      };
    } catch (error) {
      throw new Error(`Preview failed: ${error.message}`);
    }
  }
}

module.exports = new EmailTemplateService();
