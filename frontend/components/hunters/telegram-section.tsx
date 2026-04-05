"use client"

import { useEffect, useRef, useState } from "react"

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
}

const FEATURES = [
  { emoji: "🔔", text: "Уведомления BUY/SELL" },
  { emoji: "📊", text: "Статистика агента" },
  { emoji: "💬", text: "Спроси ИИ" },
  { emoji: "⚡", text: "Мгновенные алерты" },
]

export function TelegramSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set())
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-feature-id")
            if (id) {
              setVisibleFeatures((prev) => new Set([...prev, parseInt(id)]))
            } else {
              setIsVisible(true)
            }
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
      const features = sectionRef.current.querySelectorAll("[data-feature-id]")
      features.forEach((el) => observer.observe(el))
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="telegram"
      ref={sectionRef}
      className="relative py-24 px-4 bg-[#0a0a0f]"
    >
      {/* Solana gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-solana opacity-50" />

      <div className="max-w-4xl mx-auto">
        {/* Glass card */}
        <div 
          className={`animate-scale glass-card rounded-3xl p-8 md:p-12 text-center ${isVisible ? "visible" : ""}`}
        >
          {/* Telegram icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-[#0088cc]/20 flex items-center justify-center">
              <TelegramIcon className="w-10 h-10 text-[#0088cc]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Hunters Bot в Telegram
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-white/60 mb-10 max-w-md mx-auto">
            Получай AI сигналы прямо в мессенджер
          </p>

          {/* Feature pills grid */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-10">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                data-feature-id={i}
                className={`animate-scale flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 ${visibleFeatures.has(i) ? "visible" : ""}`}
                style={{ transitionDelay: `${i * 100 + 200}ms` }}
              >
                <span className="text-xl">{feature.emoji}</span>
                <span className="text-sm text-white/80 font-medium text-left">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href="https://t.me/HuntersContractsBot"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8e8] text-white font-semibold text-lg shadow-lg hover:shadow-[0_0_30px_rgba(0,136,204,0.5)] transition-all hover:scale-105"
          >
            <TelegramIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Открыть @HuntersBot</span>
          </a>

          {/* Bottom text */}
          <p className="mt-6 text-xs text-white/40 font-mono">
            Бот работает 24/7 · Powered by LLaMA 70B
          </p>
        </div>
      </div>
    </section>
  )
}
