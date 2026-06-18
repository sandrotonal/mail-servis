# FULL STACK SAAS CONTACT FORM PLATFORM

Bir Senior Software Architect ve Staff Backend Engineer gibi davran.

Amaç:
EmailJS, Web3Forms, Formspree ve Basin benzeri ancak daha gelişmiş, self-host edilebilir ve SaaS olarak satılabilir bir iletişim formu platformu geliştir.

Sistem tamamen production-ready olmalı.

## Teknoloji Stack

Backend:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Nodemailer
* Redis
* BullMQ
* bcrypt
* Helmet
* CORS
* Express Rate Limit
* Winston Logger
* Joi veya Zod Validation
* dotenv

Frontend:

* Next.js 15
* React
* TailwindCSS
* Shadcn/UI
* Recharts
* React Hook Form

Deployment:

* Docker
* Docker Compose
* Nginx
* PM2

## Mimari

Tam MVC Architecture kullanılacak.

Katmanlar:

controllers
services
repositories
middlewares
validators
models
routes
utils
jobs
queues

Kod SOLID prensiplerine uygun olacak.

Production seviyesinde klasör yapısı oluştur.

## Authentication

Özellikler:

* Register
* Login
* Logout
* Refresh Token
* Forgot Password
* Reset Password
* Email Verification
* JWT Authentication
* Role Based Access Control

Roller:

* Super Admin
* Workspace Owner
* Admin
* Member

## Workspace Sistemi

Bir kullanıcı birden fazla workspace oluşturabilsin.

Örnek:

Workspace A
Workspace B
Workspace C

Her workspace içinde:

* Projects
* Team Members
* API Keys
* Analytics

bulunmalı.

## Team Sistemi

Workspace sahibi:

* kullanıcı davet edebilsin
* rol verebilsin
* rol güncelleyebilsin
* üyeyi çıkarabilsin

## API Key Sistemi

Kullanıcı:

* API Key oluşturabilsin
* API Key yenileyebilsin
* API Key silebilsin

API Key'ler veritabanında hashlenmiş tutulmalı.

Raw key sadece ilk oluşturulduğunda gösterilmeli.

## Project Sistemi

Kullanıcı:

* proje oluşturabilsin
* proje silebilsin
* proje güncelleyebilsin

Her proje için:

* benzersiz projectId
* benzersiz endpoint

oluşturulsun.

Örnek:

POST /api/forms/project_123/send

## Form Builder

Dashboard üzerinden:

Text
Email
Phone
Textarea
Select
Checkbox
Radio
Date
File Upload

alanları eklenebilsin.

Sürükle bırak mantığı desteklensin.

## Embed Sistemi

Sistem otomatik:

iframe kodu
javascript embed kodu
react örneği
next.js örneği

oluştursun.

## Form API

İstek örneği:

POST /api/forms/send

Headers:

X-API-KEY

Body:

{
"name":"Ömer",
"email":"[omer@example.com](mailto:omer@example.com)",
"subject":"Merhaba",
"message":"Test"
}

JSON veri kabul etsin.

Dinamik alanları da desteklesin.

## Mail Sistemi

Nodemailer kullanılacak.

Desteklenecek SMTP sağlayıcıları:

* Gmail
* Brevo
* Mailgun SMTP
* Amazon SES SMTP
* Resend SMTP

Özellikler:

* HTML Mail
* Template Engine
* SMTP Pooling
* Retry Logic
* Queue System
* Failover SMTP

SMTP başarısız olursa otomatik diğer SMTP'ye geçsin.

## Mail Queue

BullMQ + Redis kullanılacak.

Akış:

Request
→ Queue
→ Worker
→ SMTP

Toplu isteklerde sistem çökmesin.

## Dosya Yükleme

Desteklenenler:

PDF
DOCX
XLSX
ZIP
PNG
JPG

Maksimum boyut ayarlanabilir olsun.

Depolama:

* AWS S3
* Cloudflare R2
* MinIO

soyutlama katmanı ile çalışsın.

## Anti Spam Sistemi

Honeypot
Rate Limiting
IP Reputation
Disposable Email Detection
Keyword Spam Detection
Cloudflare Turnstile
Google reCAPTCHA

Spam score sistemi oluştur.

## Güvenlik

Helmet
CORS
Rate Limiting
Input Validation
XSS Protection
NoSQL Injection Protection
CSRF Protection
API Key Validation

Tüm endpointler güvenli olsun.

## Domain Verification

Kullanıcı:

domain ekleyebilsin

DNS doğrulaması:

SPF
DKIM
DMARC

kayıtları desteklensin.

Domain doğrulama ekranı oluştur.

## Webhook Sistemi

Eventler:

message.received
message.sent
message.failed
project.created
api_key.created

Webhook URL tanımlanabilsin.

Retry mekanizması olsun.

## CRM Sistemi

Formdan gelen kayıtlar sadece mail olarak gitmesin.

Lead olarak kaydedilsin.

Lead Durumları:

New
Contacted
Qualified
Proposal
Won
Lost

Lead notları eklenebilsin.

## Analytics

Dashboard'da:

Toplam Mesaj
Toplam Lead
Başarılı Mail
Başarısız Mail
Günlük Kullanım
Aylık Kullanım
Ülke Bazlı Trafik
En Aktif Projeler

grafikler halinde gösterilsin.

## Billing Sistemi

Planlar:

Free
Starter
Pro
Business

Limit sistemi:

Free → 100 mail/ay
Starter → 5.000 mail/ay
Pro → 50.000 mail/ay
Business → Sınırsız

Plan middleware ile kontrol edilsin.

## Admin Panel

Super Admin:

Tüm kullanıcıları görebilsin
Workspace'leri görebilsin
Sistem loglarını görebilsin
SMTP durumlarını görebilsin
İstatistikleri görebilsin

## Loglama

Winston kullanılacak.

Kaydedilecekler:

API Logs
Auth Logs
Mail Logs
Webhook Logs
System Logs
Error Logs

## Veritabanı Koleksiyonları

users
workspaces
workspaceMembers
projects
forms
submissions
messages
leads
apiKeys
domains
smtpProviders
webhooks
logs
analytics

Tüm Mongoose modellerini oluştur.

## API Dokümantasyonu

Swagger/OpenAPI oluştur.

Tüm endpointleri dokümante et.

## Çıktı

Aşağıdakilerin tamamını eksiksiz üret:

1. Tam klasör yapısı
2. Backend kodları
3. Frontend kodları
4. Mongoose modelleri
5. Middleware'ler
6. Controller'lar
7. Service katmanı
8. Repository katmanı
9. Queue sistemi
10. Redis entegrasyonu
11. SMTP entegrasyonu
12. Swagger
13. Docker dosyaları
14. Docker Compose
15. Nginx konfigürasyonu
16. .env.example
17. Kurulum rehberi
18. Deployment rehberi
19. Production optimizasyonları
20. Güvenlik önerileri

Kodlar eksiksiz, çalıştırılabilir, production-ready ve gerçek SaaS ürünü seviyesinde olmalı.
