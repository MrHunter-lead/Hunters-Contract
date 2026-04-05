"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatedCounter } from "./animated-counter"
import { AIReasoning } from "./ai-reasoning"
import { Brain, Copy, Check, Wallet, Clock, ExternalLink } from "lucide-react"

type Decision = "BUY" | "SELL" | "WAIT"

interface Transaction {
  id: string
  coin: string
  decision: Decision
  price: number
  time: Date
  txHash: string
}

interface DashboardProps {
  prices: {
    bitcoin: number
    ethereum: number
    solana: number
  }
  priceHistory: {
    bitcoin: number[]
    ethereum: number[]
    solana: number[]
  }
  transactions: Transaction[]
  stats: {
    buyCount: number
    sellCount: number
    waitCount: number
    totalTx: number
  }
  walletBalance: number
  uptime: number
  reasoning: string
  lastUpdate: string
}

const CONTRACT_ADDRESS = "AiPbAtUTRhT1bBSeoLTNgN5ajibLKg2KeHQj4gX4ZYe9"

function getDecision(coin: string, price: number): Decision {
  if (coin === "bitcoin") {
    if (price < 70000) return "BUY"
    if (price > 80000) return "SELL"
    return "WAIT"
  }
  if (coin === "ethereum") {
    if (price < 2500) return "BUY"
    if (price > 3500) return "SELL"
    return "WAIT"
  }
  if (coin === "solana") {
    if (price < 120) return "BUY"
    if (price > 180) return "SELL"
    return "WAIT"
  }
  return "WAIT"
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 4

    ctx.clearRect(0, 0, width, height)

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const points = data.map((value, i) => ({
      x: padding + (i / (data.length - 1)) * (width - padding * 2),
      y: height - padding - ((value - min) / range) * (height - padding * 2),
    }))

    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, color + "40")
    gradient.addColorStop(1, color + "00")

    ctx.beginPath()
    ctx.moveTo(points[0].x, height)
    points.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.lineTo(points[points.length - 1].x, height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.forEach((p) => ctx.lineTo(p.x, p.y))
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
  }, [data, color])

  return <canvas ref={canvasRef} width={120} height={40} className="w-full h-10" />
}

function DecisionBadge({ decision }: { decision: Decision }) {
  const config = {
    BUY: { bg: "bg-[#14F195]/20", text: "text-[#14F195]" },
    SELL: { bg: "bg-[#FF4560]/20", text: "text-[#FF4560]" },
    WAIT: { bg: "bg-[#FFB800]/20", text: "text-[#FFB800]" },
  }
  const c = config[decision]
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${c.bg} ${c.text}`}>
      {decision}
    </span>
  )
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

// ─── Скелетон для пустого лога ────────────────────────────────────────────────
function SkeletonRow({ delay }: { delay: number }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
      style={{ animation: `pulse 2s ease-in-out ${delay}ms infinite` }}
    >
      <div className="w-10 h-5 rounded bg-white/10 animate-pulse" />
      <div className="w-14 h-5 rounded-full bg-white/10 animate-pulse" />
      <div className="w-20 h-4 rounded bg-white/10 animate-pulse" />
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-white/30 font-mono">Ожидание сигнала...</span>
      </div>
    </div>
  )
}

export function DashboardSection({
  prices,
  priceHistory,
  transactions,
  stats,
  walletBalance,
  uptime,
  reasoning,
  lastUpdate,
}: DashboardProps) {
  const [copied, setCopied] = useState(false)
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set())
  const sectionRef = useRef<HTMLElement>(null)
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setSecondsSinceUpdate((prev) => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setSecondsSinceUpdate(0)
  }, [prices])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-animate-id")
            if (id) setVisibleElements((prev) => new Set([...prev, id]))
          }
        })
      },
      { threshold: 0.15 }
    )
    const elements = sectionRef.current?.querySelectorAll("[data-animate-id]")
    elements?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const copyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isVisible = (id: string) => visibleElements.has(id)

  const coins = [
    {
      name: "Bitcoin", symbol: "BTC", price: prices.bitcoin,
      change: priceHistory.bitcoin.length > 1 ? ((prices.bitcoin - priceHistory.bitcoin[0]) / priceHistory.bitcoin[0]) * 100 : 0,
      history: priceHistory.bitcoin, decision: getDecision("bitcoin", prices.bitcoin),
      color: "#9945FF", icon: "B",
    },
    {
      name: "Ethereum", symbol: "ETH", price: prices.ethereum,
      change: priceHistory.ethereum.length > 1 ? ((prices.ethereum - priceHistory.ethereum[0]) / priceHistory.ethereum[0]) * 100 : 0,
      history: priceHistory.ethereum, decision: getDecision("ethereum", prices.ethereum),
      color: "#00D1FF", icon: "E",
    },
    {
      name: "Solana", symbol: "SOL", price: prices.solana,
      change: priceHistory.solana.length > 1 ? ((prices.solana - priceHistory.solana[0]) / priceHistory.solana[0]) * 100 : 0,
      history: priceHistory.solana, decision: getDecision("solana", prices.solana),
      color: "#14F195", icon: "S",
    },
  ]

  return (
    <section id="dashboard" ref={sectionRef} className="relative py-24 px-4 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div
          data-animate-id="dashboard-header"
          className={`animate text-center mb-16 ${isVisible("dashboard-header") ? "visible" : ""}`}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Live Intelligence</h2>
          <div className="h-1 w-32 mx-auto bg-gradient-solana rounded-full" />
        </div>

        {/* Top row - 3 cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">

          {/* Prices */}
          <div
            data-animate-id="card-prices"
            className={`animate-scale glass-card rounded-2xl p-6 ${isVisible("card-prices") ? "visible" : ""}`}
            style={{ transitionDelay: "0ms" }}
          >
            <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-4">Live Prices</h3>
            <div className="space-y-4">
              {coins.map((coin) => (
                <div key={coin.symbol} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: coin.color + "20", color: coin.color }}>
                    {coin.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{coin.symbol}</span>
                      <span className={`text-xs font-mono ${coin.change >= 0 ? "text-[#14F195]" : "text-[#FF4560]"}`}>
                        {coin.change >= 0 ? "+" : ""}{coin.change.toFixed(2)}%
                      </span>
                    </div>
                    <span className="font-mono text-lg text-white">
                      ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              {coins.map((coin) => (
                <div key={coin.symbol} className="mb-2 last:mb-0">
                  <MiniChart data={coin.history} color={coin.color} />
                </div>
              ))}
            </div>
          </div>

          {/* AI Decision */}
          <div
            data-animate-id="card-ai"
            className={`animate-scale glass-card rounded-2xl p-6 ${isVisible("card-ai") ? "visible" : ""}`}
            style={{ transitionDelay: "150ms" }}
          >
            <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-4">AI Decisions</h3>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#9945FF]/20 flex items-center justify-center animate-pulse-glow">
                  <Brain className="w-10 h-10 text-[#9945FF]" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#9945FF]/10 animate-ping" style={{ animationDuration: "2s" }} />
              </div>
            </div>
            <div className="space-y-3">
              {coins.map((coin) => (
                <div key={coin.symbol} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <span style={{ color: coin.color }}>{coin.icon}</span>
                    <span className="text-white font-medium">{coin.symbol}</span>
                  </div>
                  <DecisionBadge decision={coin.decision} />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <span className="text-xs font-mono text-white/40">Updated {secondsSinceUpdate}s ago</span>
            </div>
          </div>

          {/* Agent Status */}
          <div
            data-animate-id="card-status"
            className={`animate-scale glass-card rounded-2xl p-6 ${isVisible("card-status") ? "visible" : ""}`}
            style={{ transitionDelay: "300ms" }}
          >
            <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-4">Agent Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <Wallet className="w-5 h-5 text-[#14F195]" />
                <div>
                  <p className="text-xs text-white/50">Wallet Balance</p>
                  <p className="font-mono text-lg text-white">{walletBalance.toFixed(4)} SOL</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="relative">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F195] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#14F195]" />
                  </span>
                </div>
                <div>
                  <p className="text-xs text-white/50">Status</p>
                  <p className="font-mono text-[#14F195]">ACTIVE</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <Clock className="w-5 h-5 text-[#9945FF]" />
                <div>
                  <p className="text-xs text-white/50">Uptime</p>
                  <p className="font-mono text-lg text-white">{formatTime(uptime)}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-white/50 mb-1">Contract</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-white/80 truncate flex-1">
                    {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-8)}
                  </code>
                  <button onClick={copyAddress} className="text-white/50 hover:text-white transition-colors">
                    {copied ? <Check className="w-4 h-4 text-[#14F195]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── AI REASONING ──────────────────────────────────────────────────── */}
        <div
          data-animate-id="card-reasoning"
          className={`animate mb-6 ${isVisible("card-reasoning") ? "visible" : ""}`}
          style={{ transitionDelay: "200ms" }}
        >
          <AIReasoning reasoning={reasoning} lastUpdate={lastUpdate} />
        </div>

        {/* Bottom row - Stats + Log */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Stats */}
          <div
            data-animate-id="card-stats"
            className={`animate glass-card rounded-2xl p-6 ${isVisible("card-stats") ? "visible" : ""}`}
            style={{ transitionDelay: "450ms" }}
          >
            <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-6">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div data-animate-id="stat-buy" className={`animate-left p-4 rounded-xl bg-[#14F195]/10 border-l-4 border-[#14F195] ${isVisible("stat-buy") ? "visible" : ""}`} style={{ transitionDelay: "0ms" }}>
                <p className="font-mono text-3xl text-white"><AnimatedCounter value={stats.buyCount} /></p>
                <p className="text-sm text-white/50 mt-1">BUY Signals</p>
              </div>
              <div data-animate-id="stat-sell" className={`animate-right p-4 rounded-xl bg-[#FF4560]/10 border-l-4 border-[#FF4560] ${isVisible("stat-sell") ? "visible" : ""}`} style={{ transitionDelay: "150ms" }}>
                <p className="font-mono text-3xl text-white"><AnimatedCounter value={stats.sellCount} /></p>
                <p className="text-sm text-white/50 mt-1">SELL Signals</p>
              </div>
              <div data-animate-id="stat-wait" className={`animate-left p-4 rounded-xl bg-[#FFB800]/10 border-l-4 border-[#FFB800] ${isVisible("stat-wait") ? "visible" : ""}`} style={{ transitionDelay: "300ms" }}>
                <p className="font-mono text-3xl text-white"><AnimatedCounter value={stats.waitCount} /></p>
                <p className="text-sm text-white/50 mt-1">WAIT Signals</p>
              </div>
              <div data-animate-id="stat-total" className={`animate-right p-4 rounded-xl bg-[#9945FF]/10 border-l-4 border-[#9945FF] ${isVisible("stat-total") ? "visible" : ""}`} style={{ transitionDelay: "450ms" }}>
                <p className="font-mono text-3xl text-white"><AnimatedCounter value={stats.totalTx} /></p>
                <p className="text-sm text-white/50 mt-1">Total TXs</p>
              </div>
            </div>
          </div>

          {/* Transaction Log */}
          <div
            data-animate-id="card-log"
            className={`animate glass-card rounded-2xl p-6 ${isVisible("card-log") ? "visible" : ""}`}
            style={{ transitionDelay: "600ms" }}
          >
            <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-4">Transaction Log</h3>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
              {transactions.length === 0 ? (
                // Скелетон пока нет транзакций
                <>
                  <SkeletonRow delay={0} />
                  <SkeletonRow delay={300} />
                  <SkeletonRow delay={600} />
                </>
              ) : (
                transactions.map((tx, i) => (
                  <div
                    key={tx.id}
                    data-animate-id={`tx-row-${i}`}
                    className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors ${isVisible(`tx-row-${i}`) ? "visible" : ""}`}
                  >
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      tx.coin === "BTC" ? "bg-[#9945FF]/20 text-[#9945FF]" :
                      tx.coin === "ETH" ? "bg-[#00D1FF]/20 text-[#00D1FF]" :
                      "bg-[#14F195]/20 text-[#14F195]"
                    }`}>
                      {tx.coin}
                    </span>
                    <DecisionBadge decision={tx.decision} />
                    <span className="font-mono text-sm text-white/80">
                      ${tx.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-white/40 ml-auto">
                      {tx.time instanceof Date ? tx.time.toLocaleTimeString() : tx.time}
                    </span>
                    <a
                      href={`https://solscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/30 hover:text-[#14F195] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
