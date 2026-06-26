"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, HelpCircle, Code, Shield, Network, ArrowRight } from "lucide-react"
import { SmokeyBackground } from "@/components/auth/SmokeyBackground"
import { Header, Logo } from "@/components/layout/Header"

const DOC_SECTIONS = [
  {
    id: "getting-started",
    title: "Hızlı Başlangıç",
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">MailServis'e Hızlı Başlangıç</h2>
        <p className="text-gray-300 leading-relaxed text-sm">
          MailServis, herhangi bir backend kodu yazmanıza gerek kalmadan statik web sitelerinizden form verisi almanızı, bu verileri depolamanızı ve bildirim mailleri göndermenizi sağlayan bir SaaS platformudur.
        </p>
        <h3 className="text-lg font-semibold text-white">Nasıl Çalışır?</h3>
        <ol className="list-decimal list-inside space-y-3 text-sm text-gray-300">
          <li>MailServis paneline giriş yapın ve yeni bir <strong>Form</strong> oluşturun.</li>
          <li>Oluşturduğunuz form için size verilen benzersiz <strong>Form ID</strong>'sini alın.</li>
          <li>HTML kodunuzdaki formun <code>action</code> özniteliğine bu ID'yi içeren URL'i yerleştirin.</li>
          <li>Formunuz gönderildiğinde veriler anında panelinize yansıyacak ve size bildirim gönderilecektir.</li>
        </ol>
      </div>
    ),
  },
  {
    id: "html-forms",
    title: "HTML Form Entegrasyonu",
    icon: Code,
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">HTML Formları</h2>
        <p className="text-gray-300 leading-relaxed text-sm">
          Aşağıdaki örnekte en temel HTML formu entegrasyonunu görebilirsiniz. Burada dikkat edilmesi gereken tek nokta, formun <code>method="POST"</code> ve <code>action</code> özniteliğinin doğru yapılandırılmış olmasıdır.
        </p>
        <pre className="p-5 rounded-xl bg-black/60 border border-white/10 overflow-x-auto text-xs text-gray-300 font-mono">
{`<form action="http://localhost:5000/api/v1/forms/FORM_ID/submissions" method="POST">
  <input type="text" name="name" placeholder="Adınız" required />
  <input type="email" name="email" placeholder="E-posta" required />
  <textarea name="message" placeholder="Mesajınız" required></textarea>
  <button type="submit">Gönder</button>
</form>`}
        </pre>
        <h3 className="text-lg font-semibold text-white">Özel Yönlendirme (Redirect)</h3>
        <p className="text-gray-300 leading-relaxed text-sm">
          Kullanıcı formu başarıyla gönderdikten sonra kendi belirlediğiniz bir "Teşekkürler" sayfasına yönlendirmek isterseniz, forma gizli bir input ekleyebilirsiniz:
        </p>
        <pre className="p-5 rounded-xl bg-black/60 border border-white/10 overflow-x-auto text-xs text-gray-300 font-mono">
{`<input type="hidden" name="_next" value="https://siteniz.com/tesekkurler" />`}
        </pre>
      </div>
    ),
  },
  {
    id: "spam-protection",
    title: "Spam Koruması (Honeypot)",
    icon: Shield,
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Spam & Bot Filtreleme</h2>
        <p className="text-gray-300 leading-relaxed text-sm">
          MailServis, formlarınızı otomatik botlardan korumak için ML destekli spam filtreleri ve honeypot mekanizmaları içerir.
        </p>
        <h3 className="text-lg font-semibold text-white">Honeypot Nedir?</h3>
        <p className="text-gray-300 leading-relaxed text-sm">
          Kullanıcıların göremediği fakat spam botlarının otomatik olarak doldurduğu gizli bir alandır. Bot bu alanı doldurduğunda gönderim otomatik olarak spam olarak işaretlenir.
        </p>
        <p className="text-gray-300 leading-relaxed text-sm">
          Formunuza aşağıdaki alanı ekleyin ve CSS ile gizleyin:
        </p>
        <pre className="p-5 rounded-xl bg-black/60 border border-white/10 overflow-x-auto text-xs text-gray-300 font-mono">
{`<input type="text" name="_honeypot" style="display:none" />`}
        </pre>
      </div>
    ),
  },
  {
    id: "dns-settings",
    title: "Domain SPF & DKIM Kurulumu",
    icon: Network,
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Domain SPF, DKIM ve DMARC Ayarları</h2>
        <p className="text-gray-300 leading-relaxed text-sm">
          MailServis üzerinden gönderdiğiniz e-postaların alıcıların gelen kutusuna (inbox) düşmesini sağlamak ve spam klasöründen kaçınmak için DNS kayıtlarınızı doğrulamanız önerilir.
        </p>
        <h3 className="text-lg font-semibold text-white">1. SPF Kaydı</h3>
        <p className="text-gray-300 leading-relaxed text-sm">
          DNS sağlayıcınızda (Cloudflare, GoDaddy vb.) mevcut SPF TXT kaydınıza MailServis sunucularını ekleyin:
        </p>
        <pre className="p-5 rounded-xl bg-black/60 border border-white/10 overflow-x-auto text-xs text-gray-300 font-mono">
{`v=spf1 include:mailservis.com ~all`}
        </pre>
        <h3 className="text-lg font-semibold text-white">2. DKIM Kaydı</h3>
        <p className="text-gray-300 leading-relaxed text-sm">
          Alan adınızı panelden ekledikten sonra üretilen özel DKIM TXT anahtarını DNS kayıtlarınıza ekleyin.
        </p>
      </div>
    ),
  },
]

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("getting-started")

  const currentSection = DOC_SECTIONS.find((s) => s.id === activeTab) || DOC_SECTIONS[0]

  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
      <SmokeyBackground backdropBlurAmount="xl" color="#7342E2" className="absolute inset-0" />

      {/* Header */}
      <Header />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-28 pb-12 flex flex-col md:flex-row gap-10 flex-grow">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 block">Belgeler</span>
          {DOC_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
                activeTab === sec.id
                  ? "bg-[#7342E2] text-white shadow-md"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <sec.icon className="w-4.5 h-4.5 shrink-0" />
              <span>{sec.title}</span>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <section className="flex-grow p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          {currentSection.content}
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
