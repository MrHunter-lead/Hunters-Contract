"use client"

import { useEffect, useRef, useState } from "react"
import { Eye, Brain, Zap } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Eye,
    title: "Monitor",
    description: "CoinGecko API fetches real-time BTC, ETH, and SOL prices every 30 seconds, providing continuous market data.",
    tech: "CoinGecko API",
    timing: "Every 30s",
  },
  {
    number: "02",
    icon: Brain,
    title: "Decide",
    description: "Groq LLaMA 70B analyzes price data and market conditions to generate BUY, SELL, or WAIT signals for each asset.",
    tech: "Groq LLaMA 70B",
    timing: "< 100ms",
  },
  {
    number: "03",
    icon: Zap,
    title: "Execute",
    description: "Trading decisions are recorded immutably on the Solana blockchain via Anchor smart contract.",
    tech: "Solana + Anchor",
    timing: "400ms finality",
  },
]

export function HowItWorksSection() {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set())
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-animate-id")
            if (id) {
              setVisibleElements((prev) => new Set([...prev, id]))
            }
          }
        })
      },
      { threshold: 0.15 }
    )

    const elements = sectionRef.current?.querySelectorAll("[data-animate-id]")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const isVisible = (id: string) => visibleElements.has(id)

  return (
    <section ref={sectionRef} className="relative py-24 section-light overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div 
          data-animate-id="how-header"
          className={`animate text-center mb-20 ${isVisible("how-header") ? "visible" : ""}`}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0a0a0f] mb-4">
            How It Works
          </h2>
          <p className="text-[#0a0a0f]/60 text-lg max-w-2xl mx-auto">
            A fully autonomous pipeline from market data to on-chain execution
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2">
            <div 
              data-animate-id="how-line"
              className={`h-full bg-gradient-to-r from-[#9945FF] to-[#14F195] transition-all duration-1000 origin-left ${isVisible("how-line") ? "scale-x-100" : "scale-x-0"}`} 
              style={{ transitionDelay: "400ms" }} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div
                key={step.number}
                data-animate-id={`how-step-${index}`}
                className={`animate-scale relative ${isVisible(`how-step-${index}`) ? "visible" : ""}`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-black/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  {/* Step number badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-gradient-solana flex items-center justify-center font-bold font-mono text-white text-sm shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-solana flex items-center justify-center mb-6 shadow-lg">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-[#0a0a0f] mb-3 font-display">{step.title}</h3>
                  <p className="text-[#0a0a0f]/60 mb-6 leading-relaxed">{step.description}</p>

                  {/* Tech badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#9945FF]/10 text-[#9945FF] text-sm font-mono font-medium">
                      {step.tech}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#14F195]/10 text-[#0a0a0f] text-sm font-mono">
                      {step.timing}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
