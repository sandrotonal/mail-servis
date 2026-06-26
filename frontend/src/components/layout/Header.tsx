"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

export function Logo({ fill = "#fff", size = 28 }: { fill?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path d="M 64 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 L 128 64 L 128 64.5 L 161 32 L 192 0 L 256 0 L 256 64 L 192 128 L 128 128 L 128 192 L 96 223 L 63.5 256 L 0 256 L 0 192 Z M 256 192 L 224 223 L 191.5 256 L 128 256 L 128 192 L 192 128 L 256 128 Z" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: "Özellikler", href: "/#features" },
  { label: "Planlar", href: "/pricing" },
  { label: "Entegrasyon", href: "/integrations" },
  { label: "Belgeler", href: "/docs" },
  { label: "Destek", href: "/support" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const isLandingPage = pathname === "/"
  const useDarkText = isLandingPage && !scrolled

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
          scrolled
            ? "bg-black/60 backdrop-blur-md border-b border-white/10 shadow-lg py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo fill={useDarkText ? "#192837" : "#fff"} size={28} />
            <span className={`font-semibold text-lg tracking-tight transition-colors duration-200 ${useDarkText ? "text-[#192837]" : "text-white"}`}>MailServis</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href === "/#features" && pathname === "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive 
                      ? "text-[#a78bfa]" 
                      : useDarkText 
                        ? "text-[#192837]/75 hover:text-[#192837]" 
                        : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/auth/login"
              className={`text-sm font-semibold transition-colors duration-200 ${
                useDarkText 
                  ? "text-[#192837]/75 hover:text-[#192837]" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Giriş Yap
            </Link>
            <Link
              href="/auth/register"
              className="px-4.5 py-2 bg-[#7342E2] hover:bg-[#7342E2]/90 text-white text-sm font-semibold rounded-xl transition-all shadow-lg active:scale-95"
            >
              Ücretsiz Başla
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className={`md:hidden p-2 rounded-xl transition-colors duration-200 ${
              useDarkText 
                ? "text-[#192837] hover:bg-black/5" 
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
            aria-label="Menüyü aç"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 z-[101] w-full max-w-[300px] bg-[#111115] border-l border-white/10 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <Logo fill="#fff" size={24} />
                    <span className="font-semibold text-base text-white">MailServis</span>
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="h-px bg-white/10" />

                <nav className="flex flex-col gap-4">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-semibold text-gray-300 hover:text-white py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="space-y-3 pt-6">
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3 bg-[#7342E2] hover:bg-[#7342E2]/90 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  Ücretsiz Başla
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-sm border border-white/10 transition-all"
                >
                  Giriş Yap
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
