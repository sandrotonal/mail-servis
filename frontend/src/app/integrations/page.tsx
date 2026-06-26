"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Code, Terminal, FileJson, Copy, Check, ArrowRight } from "lucide-react"
import { SmokeyBackground } from "@/components/auth/SmokeyBackground"
import { Header, Logo } from "@/components/layout/Header"

const INTEGRATIONS = [
  {
    id: "html",
    name: "Standart HTML",
    icon: Code,
    lang: "html",
    code: `<form action="http://localhost:5000/api/v1/forms/YOUR_FORM_ID/submissions" method="POST">
  <label for="name">Ad Soyad</label>
  <input type="text" name="name" id="name" required />

  <label for="email">E-posta</label>
  <input type="email" name="email" id="email" required />

  <label for="message">Mesaj</label>
  <textarea name="message" id="message" required></textarea>

  <button type="submit">Gönder</button>
</form>`,
  },
  {
    id: "react",
    name: "React & Next.js",
    icon: Code,
    lang: "javascript",
    code: `import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const response = await fetch('http://localhost:5000/api/v1/forms/YOUR_FORM_ID/submissions', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(data)),
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.ok) setStatus('success');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form alanlarınız */}
      <button type="submit">Gönder</button>
    </form>
  );
}`,
  },
  {
    id: "curl",
    name: "cURL & REST API",
    icon: Terminal,
    lang: "bash",
    code: `curl -X POST http://localhost:5000/api/v1/forms/YOUR_FORM_ID/submissions \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "visitor@example.com",
    "name": "Ahmet Yılmaz",
    "message": "Merhaba, projeniz harika görünüyor!"
  }'`,
  },
]

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("html")
  const [copied, setCopied] = useState(false)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentInt = INTEGRATIONS.find((i) => i.id === activeTab) || INTEGRATIONS[0]

  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
      <SmokeyBackground backdropBlurAmount="xl" color="#7342E2" className="absolute inset-0" />

      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-28 pb-8 text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white">
          Saniyeler İçinde Entegre Edin
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Form backend kurulumu hiç bu kadar kolay olmamıştı. Aşağıdaki entegrasyon yöntemlerinden birini seçin ve hemen form verisi almaya başlayın.
        </p>
      </section>

      {/* Selector and Code Display */}
      <section className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-20 flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 self-center">
          {INTEGRATIONS.map((int) => (
            <button
              key={int.id}
              onClick={() => {
                setActiveTab(int.id)
                setCopied(false)
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === int.id ? "bg-[#7342E2] text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              <int.icon className="w-4.5 h-4.5" />
              {int.name}
            </button>
          ))}
        </div>

        {/* Code Panel */}
        <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {currentInt.lang} entegrasyon şablonu
            </span>
            <button
              onClick={() => handleCopy(currentInt.code)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  Kopyalandı!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Kodu Kopyala
                </>
              )}
            </button>
          </div>

          {/* Code */}
          <pre className="p-6 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed bg-[#0b0c10]/40">
            <code>{currentInt.code}</code>
          </pre>
        </div>
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
