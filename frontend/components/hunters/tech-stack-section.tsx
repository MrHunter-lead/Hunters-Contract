"use client"

import { useEffect, useRef, useState } from "react"

const techStack = [
  {
    name: "Solana",
    description: "High-performance L1 blockchain with 400ms finality",
    color: "#9945FF",
    icon: "S",
  },
  {
    name: "Anchor",
    description: "Framework for secure Solana smart contracts",
    color: "#00D1FF",
    icon: "A",
  },
  {
    name: "Groq LLaMA 70B",
    description: "Ultra-fast AI inference for real-time decisions",
    color: "#FF4560",
    icon: "G",
  },
  {
    name: "CoinGecko",
    description: "Real-time cryptocurrency price data API",
    color: "#14F195",
    icon: "C",
  },
  {
    name: "Node.js",
    description: "Runtime for the autonomous trading agent",
    color: "#FFB800",
    icon: "N",
  },
]

export function TechStackSection() {
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
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div 
          data-animate-id="tech-header"
          className={`animate text-center mb-16 ${isVisible("tech-header") ? "visible" : ""}`}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#0a0a0f] mb-4">
            Tech Stack
          </h2>
          <p className="text-[#0a0a0f]/60 text-lg">Built with cutting-edge blockchain and AI technologies</p>
        </div>

        {/* Tech grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {techStack.map((tech, index) => (
            <div
              key={tech.name}
              data-animate-id={`tech-card-${index}`}
              className={`animate-scale group ${isVisible(`tech-card-${index}`) ? "visible" : ""}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative bg-white rounded-2xl p-6 text-center border border-black/5 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full">
                {/* Icon */}
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 text-2xl font-bold transition-transform group-hover:scale-110"
                  style={{ backgroundColor: tech.color + "15", color: tech.color }}
                >
                  {tech.icon}
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-[#0a0a0f] mb-2 font-display">{tech.name}</h3>

                {/* Description */}
                <p className="text-[#0a0a0f]/60 text-sm leading-relaxed">{tech.description}</p>

                {/* Hover accent */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 group-hover:w-1/2 transition-all duration-300 rounded-full"
                  style={{ backgroundColor: tech.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
