"use client"

import { useState, useRef, useEffect } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const QUICK_QUESTIONS = [
  "Что такое Solana?",
  "Как работает агент?",
  "Что значит BUY/SELL?",
  "Что такое DeFi?",
  "Объясни смарт-контракт",
  "Почему Solana быстрая?",
]

export function ContractsAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Привет! Я Contracts Assistant 🤖 Помогу разобраться в крипте, Solana и работе AI торгового агента. Спрашивай!",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Что-то пошло не так. Попробуй ещё раз!" },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110"
        style={{
          background: "linear-gradient(135deg, #9945FF, #14F195)",
          boxShadow: open ? "0 0 30px #9945FF88" : "0 0 20px #9945FF44",
        }}
        aria-label="Открыть ассистента"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" fill="white" />
            <circle cx="12" cy="10" r="1" fill="white" />
            <circle cx="15" cy="10" r="1" fill="white" />
          </svg>
        )}
        {!open && (
          <span
            className="absolute w-14 h-14 rounded-full animate-ping"
            style={{ background: "rgba(153,69,255,0.3)" }}
          />
        )}
      </button>

      {/* Chat window */}
      <div
        className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          width: "min(360px, calc(100vw - 32px))",
          height: open ? "500px" : "0px",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          background: "rgba(10,10,20,0.97)",
          border: "1px solid rgba(153,69,255,0.3)",
          boxShadow: "0 0 40px rgba(153,69,255,0.2), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(153,69,255,0.2)", background: "rgba(153,69,255,0.1)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #9945FF, #14F195)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div>
            <div className="text-white text-sm font-semibold" style={{ fontFamily: "Space Mono, monospace" }}>
              Contracts Assistant
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs" style={{ color: "#14F195" }}>Онлайн · LLaMA 70B</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#9945FF33 transparent" }}
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                style={{
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #9945FF, #7b2fe0)"
                    : "rgba(255,255,255,0.06)",
                  color: "white",
                  border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-xl flex gap-1 items-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: "#9945FF",
                      animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions — flex-wrap в две строки */}
        <div
          className="px-3 py-2 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-2.5 py-1 rounded-full text-xs transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "rgba(153,69,255,0.15)",
                  border: "1px solid rgba(153,69,255,0.3)",
                  color: "#c084fc",
                  whiteSpace: "nowrap",
                  fontSize: "11px",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div
          className="px-3 py-3 flex gap-2 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Спроси про крипту..."
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none text-white placeholder-gray-500"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(153,69,255,0.2)",
              minWidth: 0,
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #9945FF, #14F195)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  )
}
