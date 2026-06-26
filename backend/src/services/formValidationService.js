const Form = require('../models/form');
const { ValidationError } = require('../utils/errors');

class FormValidationService {
  async validateSubmission(formId, submissionData) {
    const form = await Form.findById(formId);
    
    if (!form) {
      throw new ValidationError('Form not found');
    }

    const errors = {};
    const sanitizedData = {};

    for (const field of form.fields) {
      const value = submissionData[field.id];

      if (field.required && this.isEmpty(value)) {
        errors[field.id] = `${field.label} is required`;
        continue;
      }

      if (this.isEmpty(value)) {
        continue;
      }

      const validationResult = this.validateField(field, value);
      
      if (!validationResult.isValid) {
        errors[field.id] = validationResult.error;
      } else {
        sanitizedData[field.id] = validationResult.sanitizedValue;
      }
    }

    if (form.settings.honeypot?.enabled) {
      const honeypotField = form.settings.honeypot.fieldName || '_gotcha';
      if (submissionData[honeypotField]) {
        errors._spam = 'Submission rejected';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }

  validateField(field, value) {
    switch (field.type) {
      case 'email':
        return this.validateEmail(field, value);
      case 'phone':
        return this.validatePhone(field, value);
      case 'text':
      case 'textarea':
        return this.validateText(field, value);
      case 'select':
        return this.validateSelect(field, value);
      case 'checkbox':
        return this.validateCheckbox(field, value);
      case 'radio':
        return this.validateRadio(field, value);
      case 'date':
        return this.validateDate(field, value);
      case 'file':
        return this.validateFile(field, value);
      default:
        return { isValid: true, sanitizedValue: value };
    }
  }

  validateEmail(field, value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(value)) {
      return { isValid: false, error: 'Invalid email address' };
    }

    const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com'];
    const domain = value.split('@')[1]?.toLowerCase();
    
    if (disposableDomains.includes(domain)) {
      return { isValid: false, error: 'Disposable email addresses are not allowed' };
    }

    return { isValid: true, sanitizedValue: value.toLowerCase().trim() };
  }

  validatePhone(field, value) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    
    if (!phoneRegex.test(value)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return { isValid: false, error: 'Phone number must be between 10 and 15 digits' };
    }

    return { isValid: true, sanitizedValue: value.trim() };
  }

  validateText(field, value) {
    const stringValue = String(value).trim();

    if (field.validation?.minLength && stringValue.length < field.validation.minLength) {
      return { 
        isValid: false, 
        error: field.validation.customMessage || `Minimum ${field.validation.minLength} characters required` 
      };
    }

    if (field.validation?.maxLength && stringValue.length > field.validation.maxLength) {
      return { 
        isValid: false, 
        error: field.validation.customMessage || `Maximum ${field.validation.maxLength} characters allowed` 
      };
    }

    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(stringValue)) {
        return { 
          isValid: false, 
          error: field.validation.customMessage || 'Invalid format' 
        };
      }
    }

    const sanitized = this.sanitizeHTML(stringValue);

    return { isValid: true, sanitizedValue: sanitized };
  }

  validateSelect(field, value) {
    const validOptions = field.options?.map(opt => opt.value) || [];
    
    if (!validOptions.includes(value)) {
      return { isValid: false, error: 'Invalid selection' };
    }

    return { isValid: true, sanitizedValue: value };
  }

  validateCheckbox(field, value) {
    if (!Array.isArray(value)) {
      return { isValid: false, error: 'Invalid checkbox value' };
    }

    const validOptions = field.options?.map(opt => opt.value) || [];
    const invalidValues = value.filter(v => !validOptions.includes(v));
    
    if (invalidValues.length > 0) {
      return { isValid: false, error: 'Invalid checkbox selection' };
    }

    return { isValid: true, sanitizedValue: value };
  }

  validateRadio(field, value) {
    const validOptions = field.options?.map(opt => opt.value) || [];
    
    if (!validOptions.includes(value)) {
      return { isValid: false, error: 'Invalid radio selection' };
    }

    return { isValid: true, sanitizedValue: value };
  }

  validateDate(field, value) {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }

    if (field.validation?.min) {
      const minDate = new Date(field.validation.min);
      if (date < minDate) {
        return { isValid: false, error: `Date must be after ${minDate.toLocaleDateString()}` };
      }
    }

    if (field.validation?.max) {
      const maxDate = new Date(field.validation.max);
      if (date > maxDate) {
        return { isValid: false, error: `Date must be before ${maxDate.toLocaleDateString()}` };
      }
    }

    return { isValid: true, sanitizedValue: date.toISOString() };
  }

  validateFile(field, file) {
    if (!file) {
      return { isValid: false, error: 'No file uploaded' };
    }

    const maxSize = field.fileConfig?.maxSize || 5242880;
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(2)}MB limit` 
      };
    }

    const allowedTypes = field.fileConfig?.allowedTypes || [];
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      return { isValid: false, error: 'File type not allowed' };
    }

    return { isValid: true, sanitizedValue: file };
  }

  isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
  }

  sanitizeHTML(str) {
    const xss = require('xss');
    return xss(str, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    });
  }
}

module.exports = new FormValidationService();
