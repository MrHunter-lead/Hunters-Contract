"use client"

import { useEffect, useRef, useState } from "react"
import { Github, ExternalLink } from "lucide-react"

const CONTRACT_ADDRESS = "AiPbAtUTRhT1bBSeoLTNgN5ajibLKg2KeHQj4gX4ZYe9"
const WALLET_ADDRESS = "3nD6vntJ92yrhgKU1iEGKnN726ZoW66TxEQ8foHLehLd"

export function FooterSection() {
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
    <footer ref={sectionRef} className="relative bg-[#0a0a0f]">
      {/* Gradient line */}
      <div className="h-px bg-gradient-solana" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div 
          data-animate-id="footer-main"
          className={`animate flex flex-col md:flex-row items-center justify-between gap-8 ${isVisible("footer-main") ? "visible" : ""}`}
        >
          {/* Branding */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-solana flex items-center justify-center">
              <span className="text-white font-bold font-display text-lg">HC</span>
            </div>
            <div>
              <p className="text-white font-semibold font-display text-lg">Hunters Contracts</p>
              <p className="text-white/50 text-sm">Built for Decentrathon 2026 &middot; Team Hunters</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href={`https://solscan.io/account/${CONTRACT_ADDRESS}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-[#14F195] transition-colors text-sm font-mono"
            >
              <ExternalLink className="w-4 h-4" />
              Solscan
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Addresses */}
        <div 
          data-animate-id="footer-addresses"
          className={`animate mt-8 pt-8 border-t border-white/10 ${isVisible("footer-addresses") ? "visible" : ""}`}
          style={{ transitionDelay: "150ms" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-white/40">Contract:</span>
              <code className="text-white/60">{CONTRACT_ADDRESS}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40">Wallet:</span>
              <code className="text-white/60">{WALLET_ADDRESS}</code>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p 
          data-animate-id="footer-copyright"
          className={`animate text-center text-white/30 text-xs mt-8 font-mono ${isVisible("footer-copyright") ? "visible" : ""}`}
          style={{ transitionDelay: "300ms" }}
        >
          &copy; 2026 Hunters Contracts. Autonomous AI Trading on Solana.
        </p>
      </div>
    </footer>
  )
}
