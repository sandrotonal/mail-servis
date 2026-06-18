"use client"

import Link from "next/link"
import { ArrowRight, Mail, Shield, Zap, BarChart3, Users, CreditCard } from "lucide-react"

const features = [
  { icon: Mail, title: "Smart Form Builder", desc: "Create custom forms with drag & drop. Text, email, file uploads and more." },
  { icon: Shield, title: "Anti-Spam Protection", desc: "Honeypot, rate limiting, IP reputation, and disposable email detection." },
  { icon: Zap, title: "Queue System", desc: "BullMQ + Redis powered queue handles millions of emails without crashing." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time stats, charts, country-based traffic and project insights." },
  { icon: Users, title: "Team Collaboration", desc: "Invite team members, assign roles, manage workspaces together." },
  { icon: CreditCard, title: "Billing & Plans", desc: "Free to Business plans with usage limits and upgrade options." },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">MailServis</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">
                Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Kayıt Ol
                <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Enterprise Grade
            <span className="block text-primary">Contact Form Platform</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            EmailJS, Web3Forms ve Formspree alternatifi. Self-hosted, güvenli ve ölçeklenebilir iletişim formu altyapısı.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ücretsiz Başla
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3 text-lg font-medium hover:bg-muted transition-colors"
            >
              Özellikler
            </Link>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold text-center mb-12">Neden MailServis?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border/50 p-6 hover:border-primary/50 transition-colors">
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border/50 py-16 text-center">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-3xl font-bold mb-6">Hazır mısın?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Dakikalar içinde kurulum yap. API key ile entegre ol, formlarını oluştur, gelen mesajları yönet.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Hemen Başla
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; 2024 MailServis. All rights reserved.</p>
      </footer>
    </div>
  )
}
