"use client"

interface AIReasoningProps {
  reasoning: string
  lastUpdate: string
}

export function AIReasoning({ reasoning, lastUpdate }: AIReasoningProps) {
  const time = lastUpdate ? new Date(lastUpdate).toLocaleTimeString("ru-RU") : "—"
  const isLoading = !reasoning || reasoning === "Агент запускается..."

  return (
    <div
      className="rounded-2xl p-5 w-full animate-in fade-in"
      style={{
        background: "linear-gradient(135deg, rgba(153,69,255,0.08), rgba(20,241,149,0.04))",
        border: "1px solid rgba(153,69,255,0.25)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(153,69,255,0.25)" }}
        >
          {/* Brain icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9945FF" strokeWidth="2" strokeLinecap="round">
            <path d="M9.5 2a2.5 2.5 0 0 1 5 0v.5" />
            <path d="M14.5 2.5c1.5 0 3 1 3 3s-1 3-2.5 3.5" />
            <path d="M9.5 2.5c-1.5 0-3 1-3 3s1 3 2.5 3.5" />
            <path d="M9 9a3 3 0 0 0 6 0" />
            <path d="M6.5 15a3.5 3.5 0 0 0 3.5 3.5" />
            <path d="M17.5 15a3.5 3.5 0 0 1-3.5 3.5" />
            <path d="M12 12.5v9" />
          </svg>
        </div>
        <div>
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#9945FF", fontFamily: "Space Mono, monospace" }}
          >
            AI Reasoning
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isLoading ? "#FFB800" : "#14F195",
                animation: "pulse 2s infinite",
              }}
            />
            <span className="text-xs text-gray-500">
              {isLoading ? "Анализирую..." : `Обновлено в ${time}`}
            </span>
          </div>
        </div>

        {/* Tags справа */}
        <div className="ml-auto flex gap-1.5 flex-wrap justify-end">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(20,241,149,0.1)",
              border: "1px solid rgba(20,241,149,0.2)",
              color: "#14F195",
              fontFamily: "Space Mono, monospace",
              fontSize: "10px",
            }}
          >
            LLaMA 70B
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(153,69,255,0.1)",
              border: "1px solid rgba(153,69,255,0.2)",
              color: "#c084fc",
              fontFamily: "Space Mono, monospace",
              fontSize: "10px",
            }}
          >
            On-chain ✓
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(153,69,255,0.15)", marginBottom: "16px" }} />

      {/* Reasoning text */}
      <p
        className="text-sm leading-relaxed"
        style={{
          color: isLoading ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.8)",
          fontStyle: isLoading ? "italic" : "normal",
          minHeight: "48px",
        }}
      >
        {isLoading ? "⏳ Собираю рыночные данные для анализа..." : reasoning}
      </p>
    </div>
  )
}
