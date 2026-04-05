"use client"

import { useEffect, useState, useCallback } from "react"
import { ScrollProgress } from "@/components/hunters/scroll-progress"
import { HeroSection } from "@/components/hunters/hero-section"
import { DashboardSection } from "@/components/hunters/dashboard-section"
import { TradingChartSection } from "@/components/hunters/trading-chart-section"
import { TelegramSection } from "@/components/hunters/telegram-section"
import { HowItWorksSection } from "@/components/hunters/how-it-works-section"
import { ArchitectureSection } from "@/components/hunters/architecture-section"
import { TechStackSection } from "@/components/hunters/tech-stack-section"
import { AboutSection } from "@/components/hunters/about-section"
import { FooterSection } from "@/components/hunters/footer-section"
import { ContractsAssistant } from "@/components/hunters/contracts-assistant"

type Decision = "BUY" | "SELL" | "WAIT"

interface Transaction {
  id: string
  coin: string
  decision: Decision
  price: number
  time: Date
  txHash: string
}

interface Prices {
  bitcoin: number
  ethereum: number
  solana: number
}

interface PriceHistory {
  bitcoin: number[]
  ethereum: number[]
  solana: number[]
}

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

export default function HuntersContractsPage() {
  const [prices, setPrices] = useState<Prices>({ bitcoin: 0, ethereum: 0, solana: 0 })
  const [priceHistory, setPriceHistory] = useState<PriceHistory>({
    bitcoin: [],
    ethereum: [],
    solana: [],
  })
  const [walletBalance, setWalletBalance] = useState(0)
  const [uptime, setUptime] = useState(0)
  const [buyCount, setBuyCount] = useState(0)
  const [sellCount, setSellCount] = useState(0)
  const [waitCount, setWaitCount] = useState(0)
  const [totalTx, setTotalTx] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [reasoning, setReasoning] = useState("Агент запускается...")
  const [lastUpdate, setLastUpdate] = useState("")

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => setUptime((prev) => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchFromAgent = useCallback(async () => {
    try {
      const res = await fetch("/api/agent")
      if (!res.ok) throw new Error("Agent not running")
      const a = await res.json()

      const newPrices: Prices = {
        bitcoin: a.btcPrice || 0,
        ethereum: a.ethPrice || 0,
        solana: a.solPrice || 0,
      }
      setPrices(newPrices)

      setPriceHistory((prev) => ({
        bitcoin: newPrices.bitcoin > 0 ? [...prev.bitcoin, newPrices.bitcoin].slice(-10) : prev.bitcoin,
        ethereum: newPrices.ethereum > 0 ? [...prev.ethereum, newPrices.ethereum].slice(-10) : prev.ethereum,
        solana: newPrices.solana > 0 ? [...prev.solana, newPrices.solana].slice(-10) : prev.solana,
      }))

      setWalletBalance(a.balance || 0)
      setBuyCount(a.buyCount || 0)
      setSellCount(a.sellCount || 0)
      setWaitCount(a.waitCount || 0)
      setTotalTx(a.totalTx || 0)
      setLastUpdate(a.lastUpdate || "")

      if (a.reasoning && a.reasoning !== "Агент запускается...") {
        setReasoning(a.reasoning)
      }

      if (a.transactions && a.transactions.length > 0) {
        setTransactions(
          a.transactions.map((tx: any) => ({
            id: tx.id,
            coin: tx.coin || "BTC",
            decision: tx.decision as Decision,
            price: tx.price,
            time: new Date(),
            txHash: tx.txHash,
          }))
        )
      }
    } catch (e) {
      console.warn("Agent API unavailable, retrying...")
    }
  }, [])

  useEffect(() => {
    fetchFromAgent()
    const interval = setInterval(fetchFromAgent, 10000)
    return () => clearInterval(interval)
  }, [fetchFromAgent])

  // Decisions для TradingChartSection
  const decisions = {
    bitcoin: getDecision("bitcoin", prices.bitcoin),
    ethereum: getDecision("ethereum", prices.ethereum),
    solana: getDecision("solana", prices.solana),
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <ScrollProgress />
      <HeroSection btcPrice={prices.bitcoin} totalTransactions={totalTx} />
      <DashboardSection
        prices={prices}
        priceHistory={priceHistory}
        transactions={transactions}
        stats={{ buyCount, sellCount, waitCount, totalTx }}
        walletBalance={walletBalance}
        uptime={uptime}
        reasoning={reasoning}
        lastUpdate={lastUpdate}
      />
      <TradingChartSection prices={prices} decisions={decisions} />
      <TelegramSection />
      <HowItWorksSection />
      <ArchitectureSection />
      <TechStackSection />
      <AboutSection />
      <FooterSection />
      <ContractsAssistant />
    </main>
  )
}
