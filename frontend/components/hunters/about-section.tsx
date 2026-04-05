"use client"

import { useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"

type Language = "ru" | "en"

const CONTENT = {
  ru: {
    title: "О команде",
    subtitle: "Мы — Malware Hunters",
    description: "Молодая команда разработчиков из Казахстана, создавшая Hunters Contracts для хакатона Decentrathon 2026. Мы верим, что будущее финансов — за автономными AI системами на блокчейне.",
    banner: "Hunters Contracts — результат, а не попытка.",
    member1: {
      role: "Разработчик · Блокчейн",
      quote: "Блокчейн — это будущее.",
    },
    member2: {
      role: "Разработчик · ИИ",
      quote: "ИИ и блокчейн изменят мир.",
    },
  },
  en: {
    title: "About",
    subtitle: "We are Malware Hunters",
    description: "A young development team from Kazakhstan that built Hunters Contracts for Decentrathon 2026 hackathon. We believe the future of finance lies in autonomous AI systems on the blockchain.",
    banner: "Hunters Contracts — result, not the attempt.",
    member1: {
      role: "Developer · Blockchain",
      quote: "Blockchain is the future",
    },
    member2: {
      role: "Developer · AI",
      quote: "AI and blockchain will change the world.",
    },
  },
}

const TEAM_MEMBERS = [
  {
    initial: "M",
    gradient: "from-[#9945FF] to-[#14F195]",
    telegram: "https://t.me/runshell",
    contentKey: "member1" as const,
  },
  {
    initial: "H",
    gradient: "from-[#00D1FF] to-[#9945FF]",
    telegram: "https://t.me/tg_mogila",
    contentKey: "member2" as const,
  },
]

export function AboutSection() {
  const [lang, setLang] = useState<Language>("ru")
  const [isVisible, setIsVisible] = useState(false)
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const sectionRef = useRef<HTMLElement>(null)

  const content = CONTENT[lang]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = entry.target.getAttribute("data-card-id")
            if (cardId) {
              setVisibleCards((prev) => new Set([...prev, parseInt(cardId)]))
            } else {
              setIsVisible(true)
            }
          }
        })
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
      const cards = sectionRef.current.querySelectorAll("[data-card-id]")
      cards.forEach((el) => observer.observe(el))
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 px-4 bg-[#0a0a0f]"
    >
      <div className="max-w-5xl mx-auto">
        {/* Language toggle - top right */}
        <div className="flex justify-end mb-8">
          <div className="flex items-center p-1 bg-white/5 rounded-lg">
            <button
              onClick={() => setLang("ru")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all ${
                lang === "ru"
                  ? "bg-white/20 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-4 py-2 rounded-md text-sm font-mono transition-all ${
                lang === "en"
                  ? "bg-white/20 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Section header */}
        <div className={`animate text-center mb-16 ${isVisible ? "visible" : ""}`}>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {content.title}
          </h2>
          <h3 className="text-2xl md:text-3xl font-display font-semibold bg-gradient-solana bg-clip-text text-transparent mb-6">
            {content.subtitle}
          </h3>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Team cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {TEAM_MEMBERS.map((member, i) => {
            const memberContent = content[member.contentKey]
            return (
              <div
                key={i}
                data-card-id={i}
                className={`animate-scale glass-card rounded-2xl p-8 text-center ${visibleCards.has(i) ? "visible" : ""}`}
                style={{ transitionDelay: `${i * 200 + 200}ms` }}
              >
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-4xl font-display font-bold text-white">
                      {member.initial}
                    </span>
                  </div>
                </div>

                {/* Role */}
                <p className="text-sm font-mono text-white/60 mb-4 uppercase tracking-wider">
                  {memberContent.role}
                </p>

                {/* Telegram button */}
                <a
                  href={member.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/30 transition-colors mb-6"
                >
                  <Send className="w-4 h-4" />
                  <span className="font-medium text-sm">Telegram</span>
                </a>

                {/* Quote */}
                <p className="text-white/70 italic leading-relaxed">
                  &ldquo;{memberContent.quote}&rdquo;
                </p>
              </div>
            )
          })}
        </div>

        {/* Motivational banner */}
        <div 
          data-card-id={2}
          className={`animate text-center ${visibleCards.has(2) ? "visible" : ""}`}
          style={{ transitionDelay: "600ms" }}
        >
          <p className="text-2xl md:text-3xl lg:text-4xl font-display font-bold bg-gradient-solana bg-clip-text text-transparent leading-relaxed text-balance">
            {content.banner}
          </p>
        </div>
      </div>
    </section>
  )
}
