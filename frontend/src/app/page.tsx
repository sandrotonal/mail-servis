"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Zap, LockKeyhole, Fingerprint, ArrowRightCircle,
  CheckCircle, Shield, Globe, Code, BarChart3,
} from "lucide-react"
import { Header, Logo } from "@/components/layout/Header"

// ─── Framer Motion variants ───────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

const FEATURES = [
  { icon: Shield, title: "Spam Koruması", desc: "Honeypot, rate-limit ve ML tabanlı spam filtresi ile %99.9 temiz gelen kutusu" },
  { icon: Zap, title: "Anlık İletim", desc: "BullMQ kuyruk sistemi ile 7/24 güvenilir mail iletimi. Başarısız görevler otomatik yeniden denenir." },
  { icon: Code, title: "Kolay Entegrasyon", desc: "Tek satır HTML embed kodu veya REST API ile herhangi bir web sitesine 2 dakikada entegre et" },
  { icon: Globe, title: "Domain Doğrulama", desc: "SPF, DKIM, DMARC kayıt yönetimi. Deliverability skorunuzu maksimize edin." },
  { icon: BarChart3, title: "Detaylı Analitik", desc: "Gönderim, teslim, açılma ve spam oranlarını gerçek zamanlı takip et" },
  { icon: CheckCircle, title: "Lead Yönetimi", desc: "Gelen başvuruları CRM benzeri arayüzle yönetin, notlar ekleyin, durumu takip edin" },
]

export default function LandingPage() {
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
      <Header />

      {/* ── HERO CONTENT ── */}
      <div className="relative z-10 w-full" style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          className="flex flex-col items-center px-5 sm:px-8"
          style={{ paddingTop: "clamp(100px, 15vw, 150px)", paddingBottom: 48 }}
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