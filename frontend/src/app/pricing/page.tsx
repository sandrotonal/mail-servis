"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, HelpCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { SmokeyBackground } from "@/components/auth/SmokeyBackground"
import { Header, Logo } from "@/components/layout/Header"

const PLANS = [
  {
    name: "Ücretsiz",
    price: "0",
    desc: "Bireysel projeler ve hobi amaçlı kullanımlar için.",
    features: [
      "Aylık 100 Gönderim",
      "1 Aktif Form",
      "Temel Spam Koruması",
      "7 Günlük Veri Saklama",
      "E-posta Bildirimleri",
    ],
    cta: "Ücretsiz Başla",
    href: "/auth/register",
    popular: false,
  },
  {
    name: "Başlangıç",
    price: "299",
    desc: "Küçük işletmeler ve geliştiriciler için en ideali.",
    features: [
      "Aylık 5.000 Gönderim",
      "5 Aktif Form",
      "Gelişmiş ML Spam Koruması",
      "30 Günlük Veri Saklama",
      "Custom Email Şablonları",
      "Webhook Entegrasyonları",
      "Öncelikli Destek",
    ],
    cta: "Hemen Başla",
    href: "/auth/register",
    popular: true,
  },
  {
    name: "Profesyonel",
    price: "799",
    desc: "Büyüyen ekipler ve yüksek trafikli siteler için.",
    features: [
      "Aylık 50.000 Gönderim",
      "Sınırsız Form",
      "Premium Spam Filtreleme",
      "90 Günlük Veri Saklama",
      "Özel Domain SPF/DKIM",
      "Detaylı Raporlama & Analitik",
      "Takım Yönetimi",
      "API Erişimi",
    ],
    cta: "Hemen Başla",
    href: "/auth/register",
    popular: false,
  },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
      <SmokeyBackground backdropBlurAmount="xl" color="#7342E2" className="absolute inset-0" />

      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-28 pb-12 text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
          İhtiyacınıza Uygun Planlar
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Gizli ücretler yok. İhtiyacınıza göre ölçekleyin. İstediğiniz zaman iptal edin veya planınızı değiştirin.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <span className={`text-sm ${billingCycle === "monthly" ? "text-white font-semibold" : "text-gray-400"}`}>Aylık</span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className="w-12 h-6 rounded-full bg-[#7342E2]/35 border border-white/10 p-0.5 transition-colors relative"
          >
            <div
              className={`w-5 h-5 rounded-full bg-[#7342E2] transition-transform duration-200 ${
                billingCycle === "yearly" ? "translate-x-6" : ""
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === "yearly" ? "text-white font-semibold" : "text-gray-400"}`}>
            Yıllık <span className="text-xs bg-[#7342E2] text-white px-2 py-0.5 rounded-full font-bold ml-1">%20 Tasarruf</span>
          </span>
        </div>
      </section>

      {/* Cards */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        {PLANS.map((plan) => {
          const displayPrice =
            billingCycle === "yearly"
              ? Math.round(Number(plan.price) * 0.8 * 12)
              : Number(plan.price)

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between p-8 rounded-3xl border transition-all duration-300 ${
                plan.popular
                  ? "bg-black/50 backdrop-blur-2xl border-[#7342E2] shadow-[0_0_40px_rgba(115,66,226,0.15)] md:scale-105 z-20"
                  : "bg-black/30 backdrop-blur-xl border-white/10 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7342E2] text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                  En Popüler
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white">₺{displayPrice}</span>
                  <span className="text-gray-400 text-xs">{billingCycle === "yearly" ? "/yıl" : "/ay"}</span>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <ul className="space-y-3.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-gray-200">
                        <Check className="h-4.5 w-4.5 text-[#7342E2] shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.href}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-[#7342E2] hover:bg-[#7342E2]/90 text-white shadow-lg"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )
        })}
      </section>

      {/* Footer */}
      <footer className="mt-auto relative z-10 border-t border-white/5 py-8 w-full max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo fill="#fff" size={20} />
          <span className="font-semibold text-sm text-gray-200">MailServis</span>
        </div>
        <p className="text-gray-500 text-xs">© 2025 MailServis. Tüm hakları saklıdır.</p>
      </footer>
    </main>
  )
}
