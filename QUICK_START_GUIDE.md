# MailServis - Hızlı Başlangıç Implementasyon Rehberi

## 📋 Özet: Mevcut Durum ve Yapılacaklar

### ✅ Şu An Çalışan
- Authentication (register, login, JWT)
- Basic workspace management
- Project CRUD
- Email sending (Nodemailer + BullMQ)
- Basic API structure (MVC)
- Next.js 15 frontend setup
- Shadcn/UI components

### ❌ Eksik Kritik Özellikler
1. **Form Builder** - Hiç yok, öncelik #1
2. **Email Templates** - Template engine yok
3. **CRM Lead Management** - Notes ve activity tracking eksik
4. **Analytics Dashboard** - Grafikler yok
5. **Domain Verification** - DNS checker yok

---

## 🚀 1 Haftalık Sprint Plan (Minimum Viable Product)

### Gün 1: Form Builder Backend (4 saat)

**Dosyalar Oluştur:**
```bash
touch backend/src/models/form.js
touch backend/src/controllers/formBuilderController.js
touch backend/src/services/formValidationService.js
```

**Model Skeleton:**
```javascript
// backend/src/models/form.js
const formSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  fields: [{
    id: String,
    type: { type: String, enum: ['text', 'email', 'phone', 'textarea', 'select'] },
    label: String,
    required: Boolean,
    order: Number
  }],
  status: { type: String, enum: ['draft', 'active'], default: 'draft' }
}, { timestamps: true });
```

**Test Endpoint:**
```bash
# Create form
curl -X POST http://localhost:5000/api/v1/forms \
  -H "Content-Type: application/json" \
  -d '{"name": "Contact Form", "fields": []}'
```

### Gün 2: Form Builder Frontend (4 saat)

**Route Oluştur:**
```bash
mkdir -p frontend/src/app/dashboard/forms
touch frontend/src/app/dashboard/forms/page.tsx
```

**Minimal UI:**
- Form listesi (table)
- Add form button
- Basic form editor (input fields only)

### Gün 3: Email Template System (4 saat)

**Backend:**
```bash
npm install handlebars
touch backend/src/models/emailTemplate.js
touch backend/src/services/emailTemplateService.js
```

**Default Template:**
```handlebars
<h1>New Submission from {{formName}}</h1>
<p>Name: {{name}}</p>
<p>Email: {{email}}</p>
<p>Message: {{message}}</p>
```

### Gün 4: CRM Enhancement (4 saat)

**Lead Model Update:**
```javascript
// Add to existing backend/src/models/lead.js
notes: [{
  content: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}],
score: { type: Number, default: 0 }
```

**Lead Notes API:**
```javascript
// POST /api/v1/leads/:id/notes
exports.addNote = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  lead.notes.push({ content: req.body.content, createdBy: req.user._id });
  await lead.save();
  res.json({ success: true, data: lead });
};
```

### Gün 5: Analytics Dashboard (4 saat)

**Minimal Dashboard:**
```typescript
// frontend/src/app/dashboard/analytics/page.tsx
export default function Analytics() {
  return (
    <div>
      <h1>Analytics</h1>
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Submissions" value="1,234" />
        <StatCard title="Total Leads" value="567" />
        <StatCard title="Emails Sent" value="890" />
        <StatCard title="Conversion Rate" value="45%" />
      </div>
    </div>
  );
}
```

### Gün 6-7: Testing & Bug Fixes

**Test Checklist:**
- [ ] Create form
- [ ] Submit form via API
- [ ] Receive email
- [ ] Lead created
- [ ] Add note to lead
- [ ] View analytics

---

## 🔧 Quick Fixes (Mevcut Kodda)

### Fix 1: API Key Authentication
```javascript
// backend/src/middlewares/apiKeyAuth.js - Güncelle
const crypto = require('crypto');

const hashApiKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};
```

### Fix 2: Rate Limiting
```javascript
// backend/src/middlewares/rateLimiter.js - Per API Key
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: async (req) => {
    if (req.apiKey?.plan === 'free') return 100;
    if (req.apiKey?.plan === 'pro') return 1000;
    return 50;
  }
});
```

### Fix 3: Error Handling
```javascript
// backend/src/middlewares/errorHandler.js - Winston logging
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.url });
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
};
```

---

## 📦 NPM Paketleri Ekle

### Backend
```bash
cd backend
npm install handlebars geoip-lite mjml html-to-text
```

### Frontend
```bash
cd frontend
npm install @hello-pangea/dnd date-fns
```

---

## 🗄️ Database Migration

```javascript
// backend/scripts/migrate.js
const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Add indexes
  await mongoose.connection.collection('submissions').createIndex({ 
    project: 1, 
    createdAt: -1 
  });
  
  await mongoose.connection.collection('leads').createIndex({ 
    workspace: 1, 
    status: 1, 
    score: -1 
  });
  
  console.log('Migration completed');
  process.exit(0);
}

migrate();
```

**Run:**
```bash
node backend/scripts/migrate.js
```

---

## 🧪 Testing Setup

### Basic Test
```javascript
// backend/tests/form.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Form API', () => {
  it('should create a form', async () => {
    const res = await request(app)
      .post('/api/v1/forms')
      .send({ name: 'Test Form', fields: [] });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

**Run:**
```bash
npm test
```

---

## 📊 Success Criteria (1 Hafta Sonra)

- [ ] Form builder çalışıyor (CRUD)
- [ ] Email template rendering çalışıyor
- [ ] Lead notes eklenebiliyor
- [ ] Analytics dashboard görünüyor
- [ ] Tüm API endpoints test edildi
- [ ] Frontend-backend bağlantısı çalışıyor
- [ ] Deployment hazır

---

## 🎯 Sonraki Adımlar (2. Hafta)

1. Form builder drag-drop
2. WYSIWYG email editor
3. Kanban board for leads
4. Real-time analytics
5. Domain verification
6. Webhook retry mechanism
7. API documentation (Swagger)

---

## 💡 Pro Tips

**Backend:**
- Her endpoint için validation middleware kullan
- Service layer'da business logic, controller'da sadece routing
- Error handling consistent olsun
- Winston logger her yerde kullan

**Frontend:**
- Loading states ekle (skeleton screens)
- Error boundaries kullan
- Form validation (react-hook-form + zod)
- Toast notifications (sonner)

**Database:**
- Index'leri unutma (performance critical)
- Aggregation pipeline kullan (analytics için)
- Virtuals kullan (computed fields)

**DevOps:**
- Docker Compose ile development
- PM2 ile production
- Nginx reverse proxy
- SSL sertifikası

---

## 🚨 Hatırlatmalar

1. **Chunked Write Protocol:** Her dosya <300 satır
2. **Test Et:** Her feature'dan sonra test
3. **Git Commit:** Small, frequent commits
4. **Documentation:** README'yi güncelle
5. **Environment:** .env.example güncel tut

---

**Son Söz:** Bu plan agresif ama yapılabilir. Odaklan, scope'u daralt, ship et! 🚀
