# MailServis - Enterprise Contact Form Platform

EmailJS, Web3Forms, Formspree ve Basin benzeri self-hosted SaaS iletişim formu platformu.

## 🚀 Özellikler

- **Form Builder** - Sürükle-bırak form oluşturucu (Text, Email, Phone, File Upload, Select, vb.)
- **API Entegrasyonu** - REST API ile kolay entegrasyon, API Key yönetimi
- **Smart Email** - Nodemailer + BullMQ Queue ile güvenilir email gönderimi
- **Multi-SMTP Failover** - SMTP başarısız olursa otomatik diğer SMTP'ye geçer
- **Anti-Spam** - Honeypot, Rate Limiting, IP Reputation, Disposable Email Detection
- **CRM Sistemi** - Formdan gelen kayıtları lead olarak kaydeder ve yönetir
- **Team Sistemi** - Workspace bazlı takım çalışması, rol yönetimi
- **Webhook Sistemi** - Event bazlı webhook entegrasyonu
- **Analytics** - Detaylı istatistikler ve grafikler
- **Multi-Tenant** - Birden fazla workspace, proje ve kullanıcı desteği
- **Dosya Yükleme** - PDF, DOCX, XLSX, ZIP, PNG, JPG desteği
- **Domain Verification** - SPF, DKIM, DMARC doğrulama

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Frontend | Next.js 15, React, TailwindCSS, Shadcn/UI |
| Queue | BullMQ, Redis |
| Auth | JWT, bcrypt, Refresh Tokens |
| Email | Nodemailer, SMTP Pooling |
| Validation | Joi, Zod |
| Logging | Winston |
| API Docs | Swagger/OpenAPI |
| Storage | AWS S3, Cloudflare R2, MinIO |
| Deployment | Docker, Docker Compose, Nginx |

## 📁 Proje Yapısı

```
mail-servis/
├── backend/
│   ├── src/
│   │   ├── config/          # Konfigürasyon dosyaları
│   │   ├── controllers/     # Controller katmanı
│   │   ├── jobs/            # BullMQ worker'ları
│   │   ├── middlewares/     # Express middleware'ler
│   │   ├── models/          # Mongoose modelleri
│   │   ├── queues/          # Kuyruk tanımlamaları
│   │   ├── repositories/    # Veritabanı repositorleri
│   │   ├── routes/          # Express route tanımlamaları
│   │   ├── services/        # İş mantığı katmanı
│   │   ├── utils/           # Yardımcı fonksiyonlar
│   │   ├── validators/      # Validasyon şemaları
│   │   ├── app.js           # Express uygulaması
│   │   └── server.js        # Sunucu başlatma
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 15 App Router
│   │   ├── components/      # React bileşenleri
│   │   └── lib/             # Kütüphane ve yardımcılar
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🏃‍♂️ Hızlı Başlangıç

### Gereksinimler
- Node.js 20+
- Docker & Docker Compose
- MongoDB 7+
- Redis 7+

### Lokal Geliştirme

1. **Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

2. **Frontend**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Docker ile Çalıştırma

```bash
docker-compose up -d
```

Bu komut ile aşağıdaki servisler ayağa kalkar:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:3000
- **API Docs** → http://localhost:5000/api-docs
- **MongoDB** → localhost:27017
- **Redis** → localhost:6379
- **MinIO** → http://localhost:9001
- **Nginx** → http://localhost:80

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/v1/auth/register` | Kayıt ol |
| POST | `/api/v1/auth/login` | Giriş yap |
| POST | `/api/v1/auth/logout` | Çıkış yap |
| POST | `/api/v1/auth/refresh-token` | Token yenile |
| POST | `/api/v1/auth/forgot-password` | Şifre sıfırlama |
| POST | `/api/v1/auth/reset-password` | Şifre sıfırla |
| GET | `/api/v1/auth/me` | Kullanıcı bilgisi |

### Form API
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/v1/forms/:projectId/send` | Form gönder (API Key gerekli) |
| GET | `/api/v1/forms/:projectId/submissions` | Gönderimleri listele |
| GET | `/api/v1/forms/:projectId/embed` | Embed kodlarını al |

### Diğer
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/health` | Sağlık kontrolü |
| GET | `/api-docs` | Swagger dökümantasyonu |

## 📊 Planlar

| Plan | Aylık Mail | Özellikler |
|------|-----------|------------|
| Free | 100 | Temel özellikler |
| Starter | 5,000 | Gelişmiş özellikler |
| Pro | 50,000 | Profesyonel |
| Business | Sınırsız | Kurumsal |

## 🔒 Güvenlik

- Helmet ile HTTP header güvenliği
- CORS yapılandırması
- Rate Limiting (genel + auth + form)
- Input validasyonu (Joi)
- XSS koruması
- NoSQL injection koruması
- API Key doğrulama (SHA256 hash)
- JWT token tabanlı auth
- Refresh token rotasyonu
- bcrypt ile şifre hashleme

## 📦 Production Deployment

1. **SSL Sertifikası**
```bash
mkdir -p nginx/ssl
# Let's Encrypt ile sertifika al
certbot certonly --standalone -d mailservis.com
cp /etc/letsencrypt/live/mailservis.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/mailservis.com/privkey.pem nginx/ssl/key.pem
```

2. **Environment Variables**
```bash
cp backend/.env.example backend/.env
# Production değerlerini gir
```

3. **Build & Deploy**
```bash
docker-compose -f docker-compose.yml up -d --build
```

4. **Monitoring**
```bash
docker-compose logs -f backend
docker-compose logs -f nginx
```

## 🚨 Performans Optimizasyonları

- MongoDB index optimizasyonu
- Redis caching
- BullMQ queue ile async email
- SMTP pooling (connection pool)
- Nginx reverse proxy + caching
- GZip compression
- Response compression
- Node.js cluster mode (opsiyonel)
- MongoDB connection pooling

## 🧪 Test

```bash
# Backend testleri
cd backend && npm test

# Linting
cd backend && npm run lint
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin
4. Branch'inizi push edin
5. Pull Request açın

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.
