"use client"

import { useEffect, useRef, useState } from "react"
import { Database, Cpu, Brain, Layers, Monitor } from "lucide-react"

const nodes = [
  {
    icon: Database,
    label: "CoinGecko API",
    description: "Price Data",
    color: "#FFB800",
  },
  {
    icon: Cpu,
    label: "Node.js Agent",
    description: "Orchestrator",
    color: "#14F195",
  },
  {
    icon: Brain,
    label: "Groq LLaMA 70B",
    description: "AI Model",
    color: "#9945FF",
  },
  {
    icon: Layers,
    label: "Solana Contract",
    description: "On-Chain",
    color: "#00D1FF",
  },
  {
    icon: Monitor,
    label: "Dashboard",
    description: "Real-time UI",
    color: "#FF4560",
  },
]

export function ArchitectureSection() {
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
    <section ref={sectionRef} className="relative py-24 bg-[#0a0a0f] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-[#9945FF]/10 via-[#00D1FF]/10 to-[#14F195]/10 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div 
          data-animate-id="arch-header"
          className={`animate text-center mb-20 ${isVisible("arch-header") ? "visible" : ""}`}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            System Architecture
          </h2>
          <div className="h-1 w-32 mx-auto bg-gradient-solana rounded-full" />
        </div>

        {/* Architecture diagram */}
        <div className="relative">
          {/* Desktop: Animated connecting lines with data packets */}
          <svg 
            className="hidden md:block absolute inset-0 w-full pointer-events-none" 
            style={{ top: "50%", transform: "translateY(-50%)", height: "60px" }}
            viewBox="0 0 1000 60"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9945FF" />
                <stop offset="50%" stopColor="#00D1FF" />
                <stop offset="100%" stopColor="#14F195" />
              </linearGradient>
            </defs>
            
            {/* Main connecting line */}
            <path
              id="main-path"
              d="M 100 30 L 900 30"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              strokeDasharray="8 4"
              fill="none"
              className="animate-dash"
            />
            
            {/* Animated data packets */}
            <circle r="5" fill="#14F195">
              <animateMotion dur="3s" repeatCount="indefinite">
                <mpath href="#main-path" />
              </animateMotion>
            </circle>
            <circle r="4" fill="#9945FF">
              <animateMotion dur="3s" repeatCount="indefinite" begin="1s">
                <mpath href="#main-path" />
              </animateMotion>
            </circle>
            <circle r="3" fill="#00D1FF">
              <animateMotion dur="3s" repeatCount="indefinite" begin="2s">
                <mpath href="#main-path" />
              </animateMotion>
            </circle>
          </svg>

          {/* Nodes */}
          <div className="hidden md:flex items-center justify-between relative z-10">
            {nodes.map((node, index) => (
              <div
                key={node.label}
                data-animate-id={`arch-node-${index}`}
                className={`animate-scale ${isVisible(`arch-node-${index}`) ? "visible" : ""}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="glass-card rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300 w-40">
                  <div
                    className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: node.color + "20" }}
                  >
                    <node.icon className="w-7 h-7" style={{ color: node.color }} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{node.label}</h3>
                  <p className="text-white/50 text-xs font-mono">{node.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile layout */}
          <div className="md:hidden space-y-4">
            {nodes.map((node, index) => (
              <div
                key={node.label}
                data-animate-id={`arch-node-mobile-${index}`}
                className={`animate ${isVisible(`arch-node-mobile-${index}`) ? "visible" : ""}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
                  <div
                    className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: node.color + "20" }}
                  >
                    <node.icon className="w-6 h-6" style={{ color: node.color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{node.label}</h3>
                    <p className="text-white/50 text-sm font-mono">{node.description}</p>
                  </div>
                </div>
                {index < nodes.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-[#9945FF] to-[#14F195]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Data flow indicator */}
        <div 
          data-animate-id="arch-footer"
          className={`animate mt-16 text-center ${isVisible("arch-footer") ? "visible" : ""}`} 
          style={{ transitionDelay: "600ms" }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 glass-card rounded-full">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" style={{ animationDelay: "200ms" }} />
              <div className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
            <span className="text-white/60 text-sm font-mono">Data flows every 30 seconds</span>
          </div>
        </div>
      </div>
    </section>
  )
}
