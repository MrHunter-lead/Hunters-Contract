import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  // 1. Пробуем получить данные от агента через HTTP (для Vercel и локально)
  const agentUrl = process.env.AGENT_URL;
  if (agentUrl) {
    try {
      const res = await fetch(`${agentUrl}/api/agent`, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      console.warn("Agent HTTP unavailable, trying file fallback...");
    }
  }

  // 2. Fallback — читаем из файла (локальная разработка)
  try {
    const filePath = path.join(process.cwd(), "..", "agent-data.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    // 3. Последний fallback — пустые данные
    return NextResponse.json({
      btcPrice: 0, ethPrice: 0, solPrice: 0,
      decisions: { btc: "WAIT", eth: "WAIT", sol: "WAIT" },
      decision: "WAIT",
      reasoning: "Агент не запущен. Запусти node agent.js",
      balance: 0, buyCount: 0, sellCount: 0, waitCount: 0, totalTx: 0,
      lastUpdate: new Date().toISOString(),
      transactions: [],
      walletAddress: "",
      contractAddress: "AiPbAtUTRhT1bBSeoLTNgN5ajibLKg2KeHQj4gX4ZYe9",
      status: "offline",
    });
  }
}