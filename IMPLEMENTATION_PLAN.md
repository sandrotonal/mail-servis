# MailServis - Detaylı Implementation Planı

## 🎯 PHASE 1: Core Functionality Completion

### 1.1 Form Builder System (Priority: CRITICAL)

#### Backend Implementation

**1.1.1 Form Schema Model**
```javascript
// backend/src/models/form.js - Yeni model oluştur

const formSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  description: String,
  fields: [{
    id: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'date', 'file'],
      required: true 
    },
    label: { type: String, required: true },
    placeholder: String,
    required: { type: Boolean, default: false },
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      message: String
    },
    options: [{ label: String, value: String }], // For select, radio, checkbox
    fileConfig: {
      maxSize: Number,
      allowedTypes: [String]
    },
    order: { type: Number, required: true }
  }],
  settings: {
    submitButtonText: { type: String, default: 'Submit' },
    successMessage: { type: String, default: 'Thank you for your submission!' },
    redirectUrl: String,
    recaptcha: { type: Boolean, default: false },
    honeypot: { type: Boolean, default: true }
  },
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
  submissionCount: { type: Number, default: 0 }
}, { timestamps: true });
```

**1.1.2 Form Controller**
```javascript
// backend/src/controllers/formBuilderController.js

exports.createForm = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description, fields, settings } = req.body;

  // Verify project belongs to user's workspace
  const project = await Project.findById(projectId)
    .populate('workspace');
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check workspace access
  await checkWorkspaceAccess(req.user._id, project.workspace._id);

  const form = await Form.create({
    project: projectId,
    name,
    description,
    fields,
    settings
  });

  res.status(201).json({
    success: true,
    data: form
  });
});

exports.updateForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const updates = req.body;

  const form = await Form.findById(formId).populate('project');
  
  if (!form) {
    throw new NotFoundError('Form not found');
  }

  // Verify access
  await checkWorkspaceAccess(req.user._id, form.project.workspace);

  Object.assign(form, updates);
  await form.save();

  res.json({
    success: true,
    data: form
  });
});

exports.getForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const form = await Form.findById(formId)
    .populate('project');

  if (!form) {
    throw new NotFoundError('Form not found');
  }

  res.json({
    success: true,
    data: form
  });
});

exports.deleteForm = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const form = await Form.findById(formId).populate('project');
  
  if (!form) {
    throw new NotFoundError('Form not found');
  }

  await checkWorkspaceAccess(req.user._id, form.project.workspace);

  await form.deleteOne();

  res.json({
    success: true,
    message: 'Form deleted successfully'
  });
});
```

**1.1.3 Form Validation Service**
```javascript
// backend/src/services/formValidationService.js

class FormValidationService {
  validateSubmission(formFields, submissionData) {
    const errors = {};

    for (const field of formFields) {
      const value = submissionData[field.id];

      // Required check
      if (field.required && !value) {
        errors[field.id] = `${field.label} is required`;
        continue;
      }

      if (!value) continue;

      // Type-specific validation
      switch (field.type) {
        case 'email':
          if (!this.isValidEmail(value)) {
            errors[field.id] = 'Invalid email address';
          }
          break;

        case 'phone':
          if (!this.isValidPhone(value)) {
            errors[field.id] = 'Invalid phone number';
          }
          break;

        case 'text':
        case 'textarea':
          if (field.validation) {
            if (field.validation.min && value.length < field.validation.min) {
              errors[field.id] = `Minimum ${field.validation.min} characters required`;
            }
            if (field.validation.max && value.length > field.validation.max) {
              errors[field.id] = `Maximum ${field.validation.max} characters allowed`;
            }
            if (field.validation.pattern) {
              const regex = new RegExp(field.validation.pattern);
              if (!regex.test(value)) {
                errors[field.id] = field.validation.message || 'Invalid format';
              }
            }
          }
          break;

        case 'file':
          if (field.fileConfig) {
            if (value.size > field.fileConfig.maxSize) {
              errors[field.id] = `File size exceeds ${field.fileConfig.maxSize} bytes`;
            }
            if (!field.fileConfig.allowedTypes.includes(value.mimetype)) {
              errors[field.id] = 'File type not allowed';
            }
          }
          break;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  isValidPhone(phone) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }
}

module.exports = new FormValidationService();
```

#### Frontend Implementation

**1.1.4 Form Builder Page**
```typescript
// frontend/src/app/dashboard/projects/[projectId]/form-builder/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import FormFieldComponent from '@/components/form-builder/FormFieldComponent';
import FieldPalette from '@/components/form-builder/FieldPalette';
import FieldEditor from '@/components/form-builder/FieldEditor';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any;
  options?: Array<{ label: string; value: string }>;
  order: number;
}

export default function FormBuilderPage({ params }: { params: { projectId: string } }) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [formName, setFormName] = useState('Untitled Form');
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = (type: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: '',
      required: false,
      order: fields.length
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const updateField = (updatedField: FormField) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
    setSelectedField(updatedField);
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const saveForm = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/v1/forms/${params.projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          fields: fields.map((f, idx) => ({ ...f, order: idx }))
        })
      });

      if (response.ok) {
        // Show success toast
      }
    } catch (error) {
      console.error('Failed to save form:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Field Palette */}
      <div className="w-64 border-r p-4">
        <h2 className="font-semibold mb-4">Form Fields</h2>
        <FieldPalette onAddField={addField} />
      </div>

      {/* Center - Form Canvas */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="text-2xl font-bold border-none p-0"
              placeholder="Form Name"
            />
          </div>

          <Card className="p-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Drag and drop fields from the left panel to start building your form
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field) => (
                      <FormFieldComponent
                        key={field.id}
                        field={field}
                        isSelected={selectedField?.id === field.id}
                        onSelect={() => setSelectedField(field)}
                        onDelete={() => deleteField(field.id)}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </DndContext>
          </Card>

          <div className="mt-6 flex gap-4">
            <Button onClick={saveForm} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Form'}
            </Button>
            <Button variant="outline">Preview</Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Field Editor */}
      <div className="w-80 border-l p-4">
        {selectedField ? (
          <FieldEditor
            field={selectedField}
            onUpdate={updateField}
          />
        ) : (
          <div className="text-center text-muted-foreground mt-8">
            Select a field to edit its properties
          </div>
        )}
      </div>
    </div>
  );
}
```

### 1.2 Email Template System (Priority: HIGH)

**1.2.1 Email Template Model**
```javascript
// backend/src/models/emailTemplate.js

const emailTemplateSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
  textContent: String,
  variables: [{ 
    name: String, 
    defaultValue: String,
    description: String 
  }],
  category: { 
    type: String, 
    enum: ['notification', 'marketing', 'transactional', 'custom'],
    default: 'custom'
  },
  isDefault: { type: Boolean, default: false },
  previewData: mongoose.Schema.Types.Mixed
}, { timestamps: true });
```

**1.2.2 Email Template Service**
```javascript
// backend/src/services/emailTemplateService.js

const Handlebars = require('handlebars');

class EmailTemplateService {
  constructor() {
    this.registerHelpers();
  }

  registerHelpers() {
    Handlebars.registerHelper('formatDate', (date) => {
      return new Date(date).toLocaleDateString();
    });

    Handlebars.registerHelper('uppercase', (str) => {
      return str?.toUpperCase() || '';
    });

    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
  }

  async renderTemplate(templateId, data) {
    const template = await EmailTemplate.findById(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    const htmlCompiled = Handlebars.compile(template.htmlContent);
    const textCompiled = template.textContent 
      ? Handlebars.compile(template.textContent)
      : null;

    return {
      html: htmlCompiled(data),
      text: textCompiled ? textCompiled(data) : null,
      subject: Handlebars.compile(template.subject)(data)
    };
  }

  async createDefaultTemplates(workspaceId) {
    const defaults = [
      {
        workspace: workspaceId,
        name: 'Welcome Email',
        subject: 'Welcome to {{companyName}}!',
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9fafb; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background: #4F46E5; 
                color: white; 
                text-decoration: none; 
                border-radius: 6px; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome!</h1>
              </div>
              <div class="content">
                <p>Hi {{name}},</p>
                <p>Thank you for signing up! We're excited to have you on board.</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="{{dashboardUrl}}" class="button">Get Started</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        isDefault: true,
        category: 'notification'
      }
    ];

    await EmailTemplate.insertMany(defaults);
  }
}

module.exports = new EmailTemplateService();
```

---

*Continued in next section...*
