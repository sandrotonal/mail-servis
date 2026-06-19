"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, LockKeyhole, Fingerprint, ArrowRightCircle,
  Menu, X, CheckCircle, Shield, Globe, Code, BarChart3,
} from "lucide-react"

// ─── Logo SVG (per yap.md spec) ───────────────────────────────────────────────
function Logo({ fill = "#192837", size = 32 }: { fill?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path d="M 64 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 L 128 64 L 128 64.5 L 161 32 L 192 0 L 256 0 L 256 64 L 192 128 L 128 128 L 128 192 L 96 223 L 63.5 256 L 0 256 L 0 192 Z M 256 192 L 224 223 L 191.5 256 L 128 256 L 128 192 L 192 128 L 256 128 Z" />
    </svg>
  )
}

// ─── Framer Motion variants ───────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

// ─── Nav links ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Özellikler", href: "#features" },
  { label: "Planlar", href: "#pricing" },
  { label: "Entegrasyon", href: "#integrations" },
  { label: "Belgeler", href: "#docs" },
  { label: "Destek", href: "#support" },
]

const FEATURES = [
  { icon: Shield, title: "Spam Koruması", desc: "Honeypot, rate-limit ve ML tabanlı spam filtresi ile %99.9 temiz gelen kutusu" },
  { icon: Zap, title: "Anlık İletim", desc: "BullMQ kuyruk sistemi ile 7/24 güvenilir mail iletimi. Başarısız görevler otomatik yeniden denenir." },
  { icon: Code, title: "Kolay Entegrasyon", desc: "Tek satır HTML embed kodu veya REST API ile herhangi bir web sitesine 2 dakikada entegre et" },
  { icon: Globe, title: "Domain Doğrulama", desc: "SPF, DKIM, DMARC kayıt yönetimi. Deliverability skorunuzu maksimize edin." },
  { icon: BarChart3, title: "Detaylı Analitik", desc: "Gönderim, teslim, açılma ve spam oranlarını gerçek zamanlı takip et" },
  { icon: CheckCircle, title: "Lead Yönetimi", desc: "Gelen başvuruları CRM benzeri arayüzle yönetin, notlar ekleyin, durumu takip edin" },
]

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: "var(--font-body)", color: "var(--color-text)" }}>
      {/* ── Background Video ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_131516_eca35265-ea66-4fbd-8d52-22aae6e1a503.mp4"
      />
      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/25 via-white/10 to-white/60" />

      {/* ── NAVBAR ── */}
      <nav className="relative z-10 w-full" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="MailServis">
            <Logo fill="#192837" size={32} />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", color: "var(--color-text)", letterSpacing: "-0.01em" }}>
              MailServis
            </span>
          </Link>

          {/* Center: Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--color-text)" }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right: Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login"
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
              style={{ background: "#F2F2EE", color: "var(--color-text)" }}
            >
              Giriş Yap
            </Link>
            <Link href="/auth/register"
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
              style={{ background: "#7342E2", boxShadow: "0 4px 20px rgba(115,66,226,0.3)" }}
            >
              Ücretsiz Başla
            </Link>
          </div>

          {/* Mobile: Hamburger */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden p-2 rounded-xl transition-colors hover:bg-black/10"
            onClick={() => setMobileOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu size={24} color="var(--color-text)" />
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(25,40,55,0.35)", backdropFilter: "blur(4px)" }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
                width: "min(88vw, 360px)", height: "100dvh",
                background: "#CFC8C5",
                boxShadow: "-12px 0 48px rgba(25,40,55,0.18)",
              }}
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between px-6 py-5">
                <Logo fill="#192837" size={28} />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 40, height: 40, background: "rgba(25,40,55,0.10)" }}
                  aria-label="Menüyü kapat"
                >
                  <X size={20} color="#192837" />
                </motion.button>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(25,40,55,0.12)", margin: "0 24px" }} />

              {/* Nav links */}
              <nav className="p-6 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    custom={i}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + i * 0.07, duration: 0.4 }}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl font-medium transition-colors hover:bg-black/10"
                    style={{ fontSize: "1.1rem", color: "var(--color-text)" }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              {/* CTA buttons */}
              <div className="absolute bottom-8 left-6 right-6 space-y-3">
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3.5 rounded-full text-white font-semibold"
                  style={{ background: "#7342E2", fontSize: "0.95rem" }}>
                  Ücretsiz Başla
                </Link>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3.5 rounded-full font-semibold"
                  style={{ background: "#F2F2EE", color: "var(--color-text)", fontSize: "0.95rem" }}>
                  Giriş Yap
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── HERO CONTENT ── */}
      <div className="relative z-10 w-full" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          className="flex flex-col items-center px-5 sm:px-8"
          style={{ paddingTop: "clamp(40px, 8vw, 72px)", paddingBottom: 48 }}
        >
          <div style={{ maxWidth: 660, width: "100%", textAlign: "center" }}>
            {/* H1 */}
            <motion.h1
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.65rem, 5vw, 3rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                color: "var(--color-text)",
                textAlign: "center",
              }}
            >
              <span style={{ whiteSpace: "nowrap" }}>
                Kolayca{" "}
                <Zap size={24} color="#192837" style={{ display: "inline", verticalAlign: "middle", position: "relative", top: -2, margin: "0 4px" }} />
                Yönet
              </span>{" "}
              <LockKeyhole size={24} color="#192837" style={{ display: "inline", verticalAlign: "middle", position: "relative", top: -2, margin: "0 4px" }} />
              <br />
              Form Verilerini ve Maillerini{" "}
              <Fingerprint size={24} color="#192837" style={{ display: "inline", verticalAlign: "middle", position: "relative", top: -2, marginLeft: 6 }} />
            </motion.h1>

            {/* Subtext */}
            <motion.p
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                color: "var(--color-text)",
                opacity: 0.8,
                maxWidth: 560,
                lineHeight: 1.65,
                textAlign: "center",
                margin: "24px auto 0",
              }}
            >
              Sıfır stres, tam kontrol. Kurulum gerektirmeyen embed kodu, güçlü spam koruması ve
              gerçek zamanlı analitik ile form verilerinizi profesyonelce yönetin.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex justify-center mt-8"
            >
              <motion.a
                href="/auth/register"
                whileHover={{ scale: 1.04, filter: "brightness(1.1)" }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center justify-between text-white font-semibold"
                style={{
                  borderRadius: 50,
                  background: "#7342E2",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  padding: "17px 24px",
                  minWidth: 210,
                  boxShadow: "0 4px 24px rgba(115,66,226,0.28)",
                  gap: 32,
                  textDecoration: "none",
                }}
              >
                <span>Ücretsiz Başla</span>
                <ArrowRightCircle size={20} />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="relative z-10 py-24 px-5 sm:px-8" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "var(--color-text)" }}
          >
            Her şey burada, tam kontrol sizde
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-muted-foreground"
            style={{ maxWidth: 520, margin: "16px auto 0", lineHeight: 1.65, opacity: 0.7, color: "var(--color-text)" }}
          >
            Self-hosted SaaS contact form platformu ile tüm iletişiminizi tek yerden yönetin.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-2xl p-6 border"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(25,40,55,0.12)",
              }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(115,66,226,0.12)" }}>
                <feature.icon size={22} color="#7342E2" />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", color: "var(--color-text)", marginBottom: 8 }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "var(--color-text)", opacity: 0.75 }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="relative z-10 py-20 px-5 sm:px-8" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-12 text-center"
          style={{ background: "#7342E2" }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "white", marginBottom: 16 }}>
            Bugün başlayın, ücretsiz.
          </h2>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.8)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.65 }}>
            Kredi kartı gerekmez. 100 mail/ay ücretsiz. Dakikalar içinde kurulum.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 font-semibold"
            style={{
              background: "white",
              color: "#7342E2",
              borderRadius: 50,
              padding: "16px 32px",
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            Ücretsiz Başla
            <ArrowRightCircle size={20} />
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t py-8 px-5 sm:px-8" style={{ borderColor: "rgba(25,40,55,0.12)", maxWidth: 1280, margin: "0 auto" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo fill="#192837" size={24} />
            <span style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)", fontSize: "0.9rem" }}>MailServis</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text)", opacity: 0.5 }}>
            © 2025 MailServis. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  )
}