"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, ChevronDown, Send, Loader2 } from "lucide-react"
import { SmokeyBackground } from "@/components/auth/SmokeyBackground"
import { Header, Logo } from "@/components/layout/Header"
import { toast } from "sonner"

const FAQS = [
  {
    q: "Form verilerimiz nerede depolanıyor?",
    a: "Tüm form gönderileriniz, kendi barındırdığınız MongoDB veritabanınızda veya bulut veritabanınızda tamamen şifrelenmiş olarak depolanır. Verileriniz üzerinde tam kontrole sahip olursunuz.",
  },
  {
    q: "SPF ve DKIM ayarları neden gerekli?",
    a: "SPF ve DKIM ayarları, platform üzerinden gönderilen e-postaların alan adınız adına gönderildiğini doğrular. Bu sayede maillerinizin spam klasörüne düşmesi engellenir ve teslimat oranı en üst seviyeye çıkar.",
  },
  {
    q: "Aylık mail kotam dolduğunda ne olur?",
    a: "Kotanız dolduğunda formlarınız veri almaya devam eder fakat e-posta bildirim gönderimi geçici olarak durdurulur. Kotanızı artırmak için üst planlara geçebilir veya yeni ayı bekleyebilirsiniz.",
  },
  {
    q: "E-posta şablonlarını özelleştirebilir miyim?",
    a: "Evet! Başlangıç ve Profesyonel planlarımızda kendi özel HTML/Handlebars e-posta şablonlarınızı oluşturabilir ve müşterilerinize tamamen markanıza özel otomatik yanıtlar gönderebilirsiniz.",
  },
]

export default function SupportPage() {
  const [loading, setLoading] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate support ticket submission
    setTimeout(() => {
      setLoading(false)
      toast.success("Destek talebiniz alındı! En kısa sürede yanıtlayacağız.")
      if (e.target instanceof HTMLFormElement) {
        e.target.reset()
      }
    }, 1500)
  }

  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
      <SmokeyBackground backdropBlurAmount="xl" color="#7342E2" className="absolute inset-0" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-28 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-12 flex-grow">
        {/* Support Form */}
        <section className="p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Destek Talebi Oluşturun</h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Bir sorunuz mu var veya teknik desteğe mi ihtiyacınız var? Aşağıdaki formu doldurun, ekibimiz size 24 saat içinde yanıt versin.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7342E2] transition-colors"
                    placeholder="Adınız"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-semibold">E-posta</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7342E2] transition-colors"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Konu</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7342E2] transition-colors"
                  placeholder="Yardım almak istediğiniz konu"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-semibold">Mesaj</label>
                <textarea
                  required
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7342E2] transition-colors resize-none"
                  placeholder="Sorunuzu detaylıca yazın..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#7342E2] hover:bg-[#7342E2]/90 rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Talebi Gönder
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <HelpCircle className="text-[#7342E2]" />
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Destek ekibiyle iletişime geçmeden önce sıkça sorulan sorulara göz atabilirsiniz.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="border border-white/10 bg-black/20 backdrop-blur-xl rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left font-semibold text-sm hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${faqOpen === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/5"
                    >
                      <p className="px-6 py-4 text-gray-300 text-xs sm:text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </div>

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
