# CRM & Lead Management System - Implementation Guide

## 1. Lead Model Enhancement

### 1.1 Enhanced Lead Schema
```javascript
// backend/src/models/lead.js - Update existing model

const leadSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  
  // Contact Information
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  company: String,
  jobTitle: String,
  
  // Lead Status & Pipeline
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'new' 
  },
  score: { type: Number, min: 0, max: 100, default: 0 },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  
  // Assignment
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: Date,
  
  // Value & Conversion
  estimatedValue: Number,
  actualValue: Number,
  currency: { type: String, default: 'USD' },
  convertedAt: Date,
  
  // Source Tracking
  source: {
    type: { type: String, enum: ['form', 'api', 'import', 'manual'], default: 'form' },
    campaign: String,
    referrer: String,
    utm: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    }
  },
  
  // Custom Fields
  customFields: mongoose.Schema.Types.Mixed,
  
  // Tags & Categories
  tags: [String],
  category: String,
  
  // Notes & Activities (embedded)
  notes: [{
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['note', 'call', 'email', 'meeting', 'task'], default: 'note' }
  }],
  
  // Timeline Events
  activities: [{
    type: { type: String, required: true },
    description: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Follow-up
  nextFollowUp: Date,
  lastContactedAt: Date,
  
  // Spam/Quality Flags
  isSpam: { type: Boolean, default: false },
  qualityScore: Number,
  
  // Archive
  isArchived: { type: Boolean, default: false },
  archivedAt: Date,
  archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, { timestamps: true });

// Indexes for performance
leadSchema.index({ workspace: 1, status: 1 });
leadSchema.index({ workspace: 1, assignedTo: 1 });
leadSchema.index({ workspace: 1, score: -1 });
leadSchema.index({ email: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ nextFollowUp: 1 });

// Auto-calculate score on save
leadSchema.pre('save', async function(next) {
  if (this.isModified('status') || this.isModified('email') || this.isNew) {
    this.score = await calculateLeadScore(this);
  }
  next();
});
```

### 1.2 Lead Scoring Algorithm
```javascript
// backend/src/services/leadScoringService.js

class LeadScoringService {
  async calculateScore(lead) {
    let score = 0;
    
    // Email quality (0-20 points)
    score += this.scoreEmail(lead.email);
    
    // Completeness (0-20 points)
    score += this.scoreCompleteness(lead);
    
    // Engagement (0-20 points)
    score += this.scoreEngagement(lead);
    
    // Company/Professional (0-20 points)
    score += this.scoreCompany(lead);
    
    // Recency (0-20 points)
    score += this.scoreRecency(lead);
    
    return Math.min(100, Math.max(0, score));
  }
  
  scoreEmail(email) {
    if (!email) return 0;
    
    // Free email providers get lower score
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (freeProviders.includes(domain)) {
      return 5;
    }
    
    // Business email gets higher score
    return 20;
  }
  
  scoreCompleteness(lead) {
    let score = 0;
    
    if (lead.name) score += 5;
    if (lead.email) score += 5;
    if (lead.phone) score += 3;
    if (lead.company) score += 4;
    if (lead.jobTitle) score += 3;
    
    return score;
  }
  
  scoreEngagement(lead) {
    let score = 0;
    
    // Multiple form submissions
    if (lead.activities?.length > 1) score += 5;
    if (lead.activities?.length > 3) score += 5;
    
    // Has notes/interactions
    if (lead.notes?.length > 0) score += 5;
    
    // Recently contacted
    if (lead.lastContactedAt) {
      const daysSince = (Date.now() - lead.lastContactedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) score += 5;
    }
    
    return score;
  }
  
  scoreCompany(lead) {
    if (!lead.company) return 0;
    
    let score = 10;
    
    // Company size indicators
    if (lead.jobTitle) {
      const seniorTitles = ['director', 'manager', 'head', 'vp', 'ceo', 'cto', 'cfo'];
      const titleLower = lead.jobTitle.toLowerCase();
      
      if (seniorTitles.some(t => titleLower.includes(t))) {
        score += 10;
      }
    }
    
    return score;
  }
  
  scoreRecency(lead) {
    const daysSince = (Date.now() - lead.createdAt) / (1000 * 60 * 60 * 24);
    
    if (daysSince < 1) return 20;
    if (daysSince < 3) return 15;
    if (daysSince < 7) return 10;
    if (daysSince < 14) return 5;
    
    return 0;
  }
}

module.exports = new LeadScoringService();
```

### 1.3 Lead Controller with Full CRUD
```javascript
// backend/src/controllers/leadController.js - Enhancement

exports.getLeads = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { 
    status, 
    assignedTo, 
    priority, 
    minScore, 
    search,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 20
  } = req.query;

  // Build filter
  const filter = { workspace: workspaceId, isArchived: false };
  
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (priority) filter.priority = priority;
  if (minScore) filter.score = { $gte: parseInt(minScore) };
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name')
      .lean(),
    Lead.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: leads,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

exports.addNote = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { content, type = 'note' } = req.body;

  const lead = await Lead.findById(leadId);
  
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  lead.notes.push({
    content,
    type,
    createdBy: req.user._id,
    createdAt: new Date()
  });

  lead.activities.push({
    type: 'note_added',
    description: `${type} added`,
    performedBy: req.user._id
  });

  await lead.save();

  res.json({
    success: true,
    data: lead
  });
});

exports.updateLeadStatus = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { status, reason } = req.body;

  const lead = await Lead.findById(leadId);
  
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  const oldStatus = lead.status;
  lead.status = status;

  // Track status change
  lead.activities.push({
    type: 'status_changed',
    description: `Status changed from ${oldStatus} to ${status}`,
    performedBy: req.user._id,
    metadata: { oldStatus, newStatus: status, reason }
  });

  // Mark as converted if won
  if (status === 'won' && !lead.convertedAt) {
    lead.convertedAt = new Date();
  }

  await lead.save();

  res.json({
    success: true,
    data: lead
  });
});

exports.assignLead = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  const { userId } = req.body;

  const lead = await Lead.findById(leadId);
  
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }

  lead.assignedTo = userId;
  lead.assignedAt = new Date();

  lead.activities.push({
    type: 'assigned',
    description: 'Lead assigned',
    performedBy: req.user._id,
    metadata: { assignedTo: userId }
  });

  await lead.save();

  res.json({
    success: true,
    data: lead
  });
});
```

## 2. Kanban Board Implementation

### 2.1 Pipeline Configuration Model
```javascript
// backend/src/models/pipeline.js

const pipelineSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  name: { type: String, required: true },
  stages: [{
    id: String,
    name: String,
    color: String,
    order: Number,
    automations: [{
      trigger: String,
      action: String,
      config: mongoose.Schema.Types.Mixed
    }]
  }],
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });
```

---

*Continue with frontend kanban implementation in next file...*
