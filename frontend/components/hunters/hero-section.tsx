"use client"

import { useEffect, useState, useRef } from "react"
import { ParticleField } from "./particle-field"
import { ChevronDown } from "lucide-react"

interface HeroProps {
  btcPrice: number
  totalTransactions: number
}

export function HeroSection({ btcPrice, totalTransactions }: HeroProps) {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set())
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const orb3Ref = useRef<HTMLDivElement>(null)

  // Staggered hero entrance animation on page load
  useEffect(() => {
    const elements = [
      { id: "badge", delay: 0 },
      { id: "title-line-1", delay: 200 },
      { id: "title-line-2", delay: 400 },
      { id: "subtitle", delay: 600 },
      { id: "stats", delay: 800 },
      { id: "cta", delay: 1000 },
    ]

    const timers: NodeJS.Timeout[] = []

    elements.forEach(({ id, delay }) => {
      const timer = setTimeout(() => {
        setVisibleElements((prev) => new Set([...prev, id]))
      }, delay + 100) // +100ms initial delay
      timers.push(timer)
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  // Parallax effect on mouse move for orbs
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30
      const y = (e.clientY / window.innerHeight - 0.5) * 30

      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate(${x}px, ${y}px)`
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate(${-x}px, ${-y}px)`
      }
      if (orb3Ref.current) {
        orb3Ref.current.style.transform = `translate(${x * 0.5}px, ${y * 1.5}px)`
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const scrollToSection = () => {
    const dashboard = document.getElementById("dashboard")
    dashboard?.scrollIntoView({ behavior: "smooth" })
  }

  const isVisible = (id: string) => visibleElements.has(id)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      
      {/* Gradient orbs with parallax */}
      <div 
        ref={orb1Ref}
        className="orb-1 absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#9945FF]/20 blur-[120px] transition-transform duration-100 ease-out"
      />
      <div 
        ref={orb2Ref}
        className="orb-2 absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#14F195]/15 blur-[100px] transition-transform duration-100 ease-out"
      />
      <div 
        ref={orb3Ref}
        className="orb-3 absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-[#00D1FF]/10 blur-[80px] transition-transform duration-100 ease-out"
      />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-50" />
      
      {/* Particle field */}
      <ParticleField />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div 
          className={`animate inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 ${
            isVisible("badge") ? "visible" : ""
          }`}
          style={{ transitionDelay: "0ms" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F195] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14F195]" />
          </span>
          <span className="text-sm text-white/80 font-mono">
            Decentrathon 2026 &middot; AI + Blockchain Track
          </span>
        </div>

        {/* Title - Line 1 */}
        <h1 className="font-display font-bold tracking-tight mb-6">
          <span 
            className={`animate block text-[clamp(3rem,12vw,8rem)] leading-none text-gradient-solana ${
              isVisible("title-line-1") ? "visible" : ""
            }`}
            style={{ transitionDelay: "0ms" }}
          >
            Hunters
          </span>
          {/* Title - Line 2 */}
          <span 
            className={`animate block text-[clamp(3rem,12vw,8rem)] leading-none text-gradient-solana ${
              isVisible("title-line-2") ? "visible" : ""
            }`}
            style={{ transitionDelay: "0ms" }}
          >
            Contracts
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          className={`animate text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 ${
            isVisible("subtitle") ? "visible" : ""
          }`}
          style={{ transitionDelay: "0ms" }}
        >
          Autonomous AI Agent on Solana. Watches markets. Decides. Executes on-chain.
        </p>

        {/* Stats */}
        <div 
          className={`animate flex flex-wrap justify-center gap-4 mb-12 ${
            isVisible("stats") ? "visible" : ""
          }`}
          style={{ transitionDelay: "0ms" }}
        >
          <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full" style={{ transitionDelay: "0ms" }}>
            <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse" />
            <span className="font-mono text-sm text-white/90">
              BTC: ${btcPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full" style={{ transitionDelay: "100ms" }}>
            <span className="text-[#FFB800]">&#9889;</span>
            <span className="font-mono text-sm text-white/90">
              {totalTransactions} On-Chain Decisions
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full" style={{ transitionDelay: "200ms" }}>
            <span className="text-[#9945FF]">&#129302;</span>
            <span className="font-mono text-sm text-white/90">
              100% Autonomous
            </span>
          </div>
        </div>

        {/* CTA */}
        <button 
          onClick={scrollToSection}
          className={`animate group relative inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white overflow-hidden ${
            isVisible("cta") ? "visible" : ""
          }`}
          style={{ transitionDelay: "0ms" }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-[#9945FF] to-[#14F195] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="absolute inset-[1px] bg-[#0a0a0f] rounded-full group-hover:bg-transparent transition-colors duration-300" />
          <span className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] [mask-composite:exclude]" />
          <span className="relative z-10 flex items-center gap-2">
            View Live Dashboard
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </span>
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-white/40 font-mono">SCROLL</span>
        <ChevronDown className="w-5 h-5 text-white/40 animate-bounce-subtle" />
      </div>
    </section>
  )
}
