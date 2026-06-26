# MailServis - Acil Eylem Planı ve Öncelikler

## 🎯 Hemen Yapılması Gerekenler (1-2 Hafta)

### Hafta 1: Kritik Eksiklikleri Tamamla

#### Gün 1-2: Form Builder Core
**Backend:**
- [ ] `backend/src/models/form.js` - Form schema modeli oluştur
- [ ] `backend/src/controllers/formBuilderController.js` - CRUD endpoints
- [ ] `backend/src/services/formValidationService.js` - Validation engine
- [ ] `backend/src/routes/forms.js` - Route'ları güncelle

**Frontend:**
- [ ] `frontend/src/app/dashboard/projects/[projectId]/forms/page.tsx` - Form listesi
- [ ] `frontend/src/app/dashboard/projects/[projectId]/forms/builder/page.tsx` - Builder UI
- [ ] `frontend/src/components/form-builder/FieldPalette.tsx` - Sürüklenebilir field'lar
- [ ] `frontend/src/components/form-builder/FormCanvas.tsx` - Ana canvas
- [ ] `frontend/src/components/form-builder/FieldEditor.tsx` - Property editor

**Dependencies Ekle:**
```bash
cd backend && npm install handlebars
cd frontend && npm install @hello-pangea/dnd react-beautiful-dnd
```

#### Gün 3-4: Email Template System
**Backend:**
- [ ] `backend/src/models/emailTemplate.js` - Template modeli
- [ ] `backend/src/services/emailTemplateService.js` - Template rendering
- [ ] `backend/src/controllers/emailTemplateController.js` - Template CRUD
- [ ] Default template'leri oluştur (Welcome, Notification, Form Response)

**Frontend:**
- [ ] `frontend/src/app/dashboard/email-templates/page.tsx` - Template listesi
- [ ] `frontend/src/app/dashboard/email-templates/[id]/editor/page.tsx` - WYSIWYG editor
- [ ] `frontend/src/components/email-editor/TemplateEditor.tsx` - Rich text editor

**Dependencies:**
```bash
cd frontend && npm install @tiptap/react @tiptap/starter-kit
```

#### Gün 5-7: CRM Enhancement
**Backend:**
- [ ] `backend/src/models/lead.js` güncelle - Notes, activities, scoring
- [ ] `backend/src/services/leadScoringService.js` - Auto scoring algorithm
- [ ] `backend/src/controllers/leadController.js` - Gelişmiş CRUD
- [ ] Lead status değişim tracking

**Frontend:**
- [ ] `frontend/src/app/dashboard/leads/kanban/page.tsx` - Kanban board view
- [ ] `frontend/src/app/dashboard/leads/[id]/page.tsx` - Lead detail page
- [ ] `frontend/src/components/leads/LeadCard.tsx` - Draggable card
- [ ] `frontend/src/components/leads/NotesList.tsx` - Notes component

**Dependencies:**
```bash
cd frontend && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Hafta 2: Analytics ve Domain Verification

#### Gün 8-10: Analytics Dashboard
**Backend:**
- [ ] `backend/src/models/analytics.js` güncelle - Detaylı metrikler
- [ ] `backend/src/services/analyticsService.js` - Tracking logic
- [ ] `backend/src/jobs/analyticsAggregation.js` - Daily aggregation job
- [ ] GeoIP tracking ekle

**Frontend:**
- [ ] `frontend/src/app/dashboard/analytics/page.tsx` - Ana dashboard
- [ ] `frontend/src/components/analytics/StatsCards.tsx` - Metric cards
- [ ] `frontend/src/components/analytics/ChartsSection.tsx` - Recharts graphs
- [ ] `frontend/src/components/analytics/CountryMap.tsx` - Geographic view

**Dependencies:**
```bash
cd backend && npm install geoip-lite
cd frontend && npm install recharts date-fns
```

#### Gün 11-12: Domain Verification
**Backend:**
- [ ] `backend/src/models/domain.js` güncelle - SPF/DKIM/DMARC fields
- [ ] `backend/src/services/dnsVerificationService.js` - DNS checker
- [ ] `backend/src/controllers/domainController.js` - Verification endpoints
- [ ] Cron job for periodic re-verification

**Frontend:**
- [ ] `frontend/src/app/dashboard/domains/page.tsx` - Domain listesi
- [ ] `frontend/src/app/dashboard/domains/[id]/verify/page.tsx` - Verification UI
- [ ] `frontend/src/components/domains/DNSRecordsTable.tsx` - Instructions
- [ ] `frontend/src/components/domains/VerificationStatus.tsx` - Status indicator

**Dependencies:**
```bash
cd backend && npm install dns-packet node-dns-sd
```

#### Gün 13-14: Testing & Bug Fixes
- [ ] Unit tests için Jest setup
- [ ] API endpoint testleri (Supertest)
- [ ] Form builder manuel test
- [ ] Email template test
- [ ] CRM workflow test
- [ ] Bug fixing

## 📦 Eksik npm Paketleri

### Backend (backend/package.json ekle)
```json
{
  "dependencies": {
    "handlebars": "^4.7.8",
    "geoip-lite": "^1.4.10",
    "dns-packet": "^5.6.1",
    "mjml": "^4.15.3",
    "html-to-text": "^9.0.5",
    "@aws-sdk/client-s3": "^3.515.0",
    "@aws-sdk/s3-request-presigner": "^3.515.0"
  }
}
```

### Frontend (frontend/package.json ekle)
```json
{
  "dependencies": {
    "@hello-pangea/dnd": "^16.5.0",
    "@tiptap/react": "^2.1.16",
    "@tiptap/starter-kit": "^2.1.16",
    "react-day-picker": "^8.10.0",
    "cmdk": "^0.2.0"
  }
}
```

## 🔧 Configuration Updates

### Backend .env eklenecekler
```env
# GeoIP
GEOIP_UPDATE_INTERVAL=7d

# Email Templates
MJML_VALIDATION=true
TEMPLATE_CACHE_TTL=3600

# DNS Verification
DNS_VERIFICATION_TIMEOUT=5000
DNS_RETRY_ATTEMPTS=3
```

### Database Indexes Ekle
```javascript
// MongoDB shell'de çalıştır
db.submissions.createIndex({ "project": 1, "createdAt": -1 });
db.leads.createIndex({ "workspace": 1, "status": 1, "score": -1 });
db.analytics.createIndex({ "workspace": 1, "date": -1 });
db.forms.createIndex({ "project": 1, "status": 1 });
db.emailTemplates.createIndex({ "workspace": 1, "category": 1 });
```

## 🚀 Quick Start Commands

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Setup Database Indexes
```bash
cd backend
node scripts/setup-indexes.js
```

### 3. Run Development
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - Redis & MongoDB (Docker)
docker-compose up -d mongo redis
```

## 📝 Önemli Notlar

### Form Builder için
- @dnd-kit kullan (@hello-pangea/dnd yerine) - daha stabil
- Field type'lar için Zod validation
- Preview mode ekle
- Auto-save functionality

### Email Templates için
- MJML kullan (responsive email için)
- Handlebars template engine
- Preview functionality critical
- Variable substitution test et

### CRM için
- Lead scoring otomatik hesaplanmalı
- Activity timeline real-time
- Kanban sürükle-bırak smooth olmalı
- Filter & search performanslı

### Analytics için
- Real-time tracking değil, batch processing
- Cron job her gece 00:00'da aggregate
- Redis cache kullan query'ler için
- Chart performance optimize et

## 🐛 Bilinen Sorunlar ve Çözümler

### Sorun 1: Email Queue Stuck
**Çözüm:**
```bash
# Redis'te queue'yu temizle
redis-cli FLUSHDB
# Worker'ı restart et
pm2 restart mail-worker
```

### Sorun 2: MongoDB Connection Pool
**Çözüm:**
```javascript
// backend/src/config/database.js
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
});
```

### Sorun 3: CORS Issues
**Çözüm:**
```javascript
// backend/src/app.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

## 📊 Success Metrics

### Week 1 Completion:
- [ ] Form builder functional (create, edit, preview)
- [ ] Email templates (3 default templates)
- [ ] CRM kanban board working
- [ ] Lead scoring active

### Week 2 Completion:
- [ ] Analytics dashboard live
- [ ] Domain verification working
- [ ] All major bugs fixed
- [ ] Basic tests passing

## 🎯 Next Steps (Week 3+)

1. **Billing System** - Stripe integration
2. **Webhook Enhancements** - Retry mechanism
3. **API Documentation** - Swagger complete
4. **Performance Optimization** - Caching, indexes
5. **Monitoring** - Sentry, logging

---

**NOT:** Bu plan agresif ama gerçekçi. Her gün odaklanarak ilerle.
