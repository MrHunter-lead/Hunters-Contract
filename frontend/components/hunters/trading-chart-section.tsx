"use client"

import { useEffect, useRef, useState, useCallback } from "react"

type Decision = "BUY" | "SELL" | "WAIT"

interface OHLC {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface TradingChartProps {
  prices: {
    bitcoin: number
    ethereum: number
    solana: number
  }
  decisions: {
    bitcoin: Decision
    ethereum: Decision
    solana: Decision
  }
}

type CoinKey = "bitcoin" | "ethereum" | "solana"
type Timeframe = "30s" | "1m" | "5m"

const COINS = [
  { key: "bitcoin" as CoinKey, symbol: "BTC", color: "#9945FF" },
  { key: "ethereum" as CoinKey, symbol: "ETH", color: "#00D1FF" },
  { key: "solana" as CoinKey, symbol: "SOL", color: "#14F195" },
]

function getDecisionConfig(decision: Decision) {
  const config = {
    BUY: { bg: "bg-[#14F195]/20", text: "text-[#14F195]", glow: "shadow-[0_0_20px_rgba(20,241,149,0.4)]" },
    SELL: { bg: "bg-[#FF4560]/20", text: "text-[#FF4560]", glow: "shadow-[0_0_20px_rgba(255,69,96,0.4)]" },
    WAIT: { bg: "bg-[#FFB800]/20", text: "text-[#FFB800]", glow: "shadow-[0_0_20px_rgba(255,184,0,0.4)]" },
  }
  return config[decision]
}

// Generate realistic OHLC data based on current price
function generateOHLCData(basePrice: number, count: number, volatilityPercent: number = 0.5): OHLC[] {
  const data: OHLC[] = []
  let currentPrice = basePrice * (0.98 + Math.random() * 0.04) // Start slightly offset
  const now = Date.now()

  for (let i = count - 1; i >= 0; i--) {
    const volatility = currentPrice * (volatilityPercent / 100)
    const open = currentPrice
    const change = (Math.random() - 0.5) * volatility * 2
    const close = open + change
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    const volume = 100 + Math.random() * 900

    data.push({
      time: now - i * 30000, // 30 second intervals
      open,
      high,
      low,
      close,
      volume,
    })

    currentPrice = close
  }

  // Adjust the last candle to end at the actual current price
  if (data.length > 0) {
    const last = data[data.length - 1]
    last.close = basePrice
    last.high = Math.max(last.high, basePrice)
    last.low = Math.min(last.low, basePrice)
  }

  return data
}

function CandlestickChart({ 
  data, 
  width, 
  height,
  accentColor 
}: { 
  data: OHLC[]
  width: number
  height: number
  accentColor: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; candle: OHLC | null } | null>(null)

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.fillStyle = "#0a0a0f"
    ctx.fillRect(0, 0, width, height)

    const padding = { top: 20, right: 70, bottom: 60, left: 10 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    const volumeHeight = chartHeight * 0.25
    const priceHeight = chartHeight - volumeHeight - 10

    // Calculate price range
    const prices = data.flatMap(d => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1
    const pricePadding = priceRange * 0.1

    // Calculate volume range
    const maxVolume = Math.max(...data.map(d => d.volume))

    // Draw grid
    ctx.strokeStyle = "#1a1a2e"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (priceHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      // Price labels
      const price = maxPrice + pricePadding - ((priceRange + pricePadding * 2) / 4) * i
      ctx.fillStyle = "#666"
      ctx.font = "11px 'Space Mono', monospace"
      ctx.textAlign = "left"
      ctx.fillText(`$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, width - padding.right + 5, y + 4)
    }

    // Candle width
    const candleSpacing = chartWidth / data.length
    const candleWidth = Math.max(3, candleSpacing * 0.7)

    // Draw candles
    data.forEach((candle, i) => {
      const x = padding.left + candleSpacing * i + candleSpacing / 2
      const isBullish = candle.close >= candle.open

      // Scale prices to chart
      const scaleY = (price: number) => {
        return padding.top + priceHeight - ((price - (minPrice - pricePadding)) / (priceRange + pricePadding * 2)) * priceHeight
      }

      const openY = scaleY(candle.open)
      const closeY = scaleY(candle.close)
      const highY = scaleY(candle.high)
      const lowY = scaleY(candle.low)

      // Wick
      ctx.strokeStyle = isBullish ? "#14F195" : "#FF4560"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // Body
      ctx.fillStyle = isBullish ? "#14F195" : "#FF4560"
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.max(1, Math.abs(closeY - openY))
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight)

      // Volume bar
      const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight
      const volumeY = height - padding.bottom - volumeBarHeight
      ctx.fillStyle = isBullish ? "rgba(20, 241, 149, 0.3)" : "rgba(255, 69, 96, 0.3)"
      ctx.fillRect(x - candleWidth / 2, volumeY, candleWidth, volumeBarHeight)
    })

    // Draw time axis
    ctx.fillStyle = "#666"
    ctx.font = "10px 'Space Mono', monospace"
    ctx.textAlign = "center"
    
    const step = Math.ceil(data.length / 6)
    for (let i = 0; i < data.length; i += step) {
      const x = padding.left + candleSpacing * i + candleSpacing / 2
      const time = new Date(data[i].time)
      ctx.fillText(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), x, height - padding.bottom + 20)
    }

    // Draw crosshair if active
    if (crosshair && crosshair.candle) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
      ctx.setLineDash([5, 5])
      ctx.lineWidth = 1

      // Vertical line
      ctx.beginPath()
      ctx.moveTo(crosshair.x, padding.top)
      ctx.lineTo(crosshair.x, height - padding.bottom)
      ctx.stroke()

      // Horizontal line
      ctx.beginPath()
      ctx.moveTo(padding.left, crosshair.y)
      ctx.lineTo(width - padding.right, crosshair.y)
      ctx.stroke()

      ctx.setLineDash([])

      // OHLC tooltip
      const c = crosshair.candle
      ctx.fillStyle = "rgba(26, 26, 46, 0.95)"
      ctx.fillRect(10, 10, 180, 90)
      ctx.strokeStyle = accentColor
      ctx.lineWidth = 1
      ctx.strokeRect(10, 10, 180, 90)

      ctx.fillStyle = "#fff"
      ctx.font = "11px 'Space Mono', monospace"
      ctx.textAlign = "left"
      ctx.fillText(`O: $${c.open.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 20, 32)
      ctx.fillText(`H: $${c.high.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 20, 50)
      ctx.fillText(`L: $${c.low.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 20, 68)
      ctx.fillText(`C: $${c.close.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 20, 86)
    }
  }, [data, width, height, crosshair, accentColor])

  useEffect(() => {
    drawChart()
  }, [drawChart])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const padding = { left: 10, right: 70 }
    const chartWidth = width - padding.left - padding.right
    const candleSpacing = chartWidth / data.length
    const index = Math.floor((x - padding.left) / candleSpacing)

    if (index >= 0 && index < data.length) {
      setCrosshair({ x, y, candle: data[index] })
    } else {
      setCrosshair(null)
    }
  }

  const handleMouseLeave = () => {
    setCrosshair(null)
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full cursor-crosshair"
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  )
}

export function TradingChartSection({ prices, decisions }: TradingChartProps) {
  const [selectedCoin, setSelectedCoin] = useState<CoinKey>("bitcoin")
  const [timeframe, setTimeframe] = useState<Timeframe>("30s")
  const [ohlcData, setOhlcData] = useState<{ [key in CoinKey]: OHLC[] }>({
    bitcoin: [],
    ethereum: [],
    solana: [],
  })
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartSize, setChartSize] = useState({ width: 800, height: 400 })

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Update chart size on resize
  useEffect(() => {
    const updateSize = () => {
      if (chartContainerRef.current) {
        const rect = chartContainerRef.current.getBoundingClientRect()
        setChartSize({ width: rect.width, height: Math.min(450, window.innerHeight * 0.5) })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Initialize OHLC data
  useEffect(() => {
    if (prices.bitcoin > 0 && ohlcData.bitcoin.length === 0) {
      setOhlcData({
        bitcoin: generateOHLCData(prices.bitcoin, 50, 0.3),
        ethereum: generateOHLCData(prices.ethereum, 50, 0.5),
        solana: generateOHLCData(prices.solana, 50, 0.8),
      })
    }
  }, [prices, ohlcData.bitcoin.length])

  // Update last candle when price changes
  useEffect(() => {
    if (prices.bitcoin > 0 && ohlcData.bitcoin.length > 0) {
      setOhlcData((prev) => {
        const updated = { ...prev }
        
        COINS.forEach(({ key }) => {
          const newPrice = prices[key]
          const data = [...prev[key]]
          
          if (data.length > 0) {
            const last = { ...data[data.length - 1] }
            last.close = newPrice
            last.high = Math.max(last.high, newPrice)
            last.low = Math.min(last.low, newPrice)
            data[data.length - 1] = last
            updated[key] = data
          }
        })
        
        return updated
      })
    }
  }, [prices])

  const currentCoin = COINS.find(c => c.key === selectedCoin)!
  const currentPrice = prices[selectedCoin]
  const currentDecision = decisions[selectedCoin]
  const decisionConfig = getDecisionConfig(currentDecision)

  // Calculate price change from first candle
  const priceChange = ohlcData[selectedCoin].length > 0
    ? ((currentPrice - ohlcData[selectedCoin][0].open) / ohlcData[selectedCoin][0].open) * 100
    : 0

  return (
    <section
      id="trading-chart"
      ref={sectionRef}
      className="relative py-24 px-4 bg-[#0a0a0f]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className={`animate text-center mb-12 ${isVisible ? "visible" : ""}`}>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Live Market Chart
          </h2>
          <div className="h-1 w-32 mx-auto bg-gradient-solana rounded-full" />
        </div>

        {/* Chart container */}
        <div 
          className={`animate glass-card rounded-2xl p-6 ${isVisible ? "visible" : ""}`}
          style={{ transitionDelay: "200ms" }}
        >
          {/* Top controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Coin tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl">
              {COINS.map((coin) => (
                <button
                  key={coin.key}
                  onClick={() => setSelectedCoin(coin.key)}
                  className={`px-4 py-2 rounded-lg font-mono text-sm font-medium transition-all ${
                    selectedCoin === coin.key
                      ? "bg-[#9945FF] text-white shadow-[0_0_20px_rgba(153,69,255,0.4)]"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {coin.symbol}
                </button>
              ))}
            </div>

            {/* Price display + decision */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl text-white font-bold">
                    ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  <span className={`font-mono text-sm ${priceChange >= 0 ? "text-[#14F195]" : "text-[#FF4560]"}`}>
                    {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                  </span>
                </div>
                <span className="text-xs text-white/40 font-mono">{currentCoin.symbol}/USD</span>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-mono font-bold ${decisionConfig.bg} ${decisionConfig.text} ${decisionConfig.glow}`}>
                AI: {currentDecision}
              </span>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
              {(["30s", "1m", "5m"] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                    timeframe === tf
                      ? "bg-white/20 text-white"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div ref={chartContainerRef} className="relative rounded-xl overflow-hidden bg-[#0a0a0f] border border-white/5">
            {ohlcData[selectedCoin].length > 0 ? (
              <CandlestickChart
                data={ohlcData[selectedCoin]}
                width={chartSize.width}
                height={chartSize.height}
                accentColor={currentCoin.color}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-white/40 font-mono">Loading chart data...</div>
              </div>
            )}
          </div>

          {/* Bottom info */}
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-white/40">
            <span>Candlestick Chart - {timeframe} intervals</span>
            <span>Powered by Hunters AI</span>
          </div>
        </div>
      </div>
    </section>
  )
}
