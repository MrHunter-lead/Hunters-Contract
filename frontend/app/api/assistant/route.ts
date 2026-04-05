import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: "API ключ не настроен." }, { status: 500 })
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Ты Contracts Assistant — AI помощник платформы Hunters Contracts. Это автономный AI торговый агент на блокчейне Solana, созданный для хакатона Decentrathon 2026.

Ты помогаешь пользователям понять:
- Криптовалюты (Bitcoin, Ethereum, Solana, DeFi, NFT, кошельки)
- Как работает агент Hunters Contracts (мониторит цены BTC/ETH/SOL, использует LLaMA 70B для решений BUY/SELL/WAIT, записывает решения в блокчейн Solana)
- Основы блокчейна Solana (быстрый, дешёвый, Proof of History)
- Смарт-контракты и как они работают
- Торговые сигналы BUY/SELL/WAIT

Отвечай ТОЛЬКО на русском языке. Держи ответы короткими (2-4 предложения). Можно использовать 1-2 эмодзи. Никогда не давай финансовых советов — всегда уточняй, что это AI сигналы в образовательных целях.`,
          },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("Groq error:", err)
      return NextResponse.json({ reply: "Ошибка запроса к AI. Попробуй ещё раз!" }, { status: 500 })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || "Что-то пошло не так. Попробуй ещё раз!"
    return NextResponse.json({ reply })
  } catch (e) {
    console.error("Assistant error:", e)
    return NextResponse.json({ reply: "Произошла ошибка. Попробуй ещё раз!" }, { status: 500 })
  }
}
