const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const anchor = require("@coral-xyz/anchor");
const fs = require("fs");
const http = require("http");
const Groq = require("groq-sdk");
require("dotenv").config();

const connection = new Connection(process.env.RPC_URL, "confirmed");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── История цен (стартовая) ──────────────────────────────────────────────────
const priceHistory = {
  btc: [67200, 67050, 66900, 66750, 66800, 66850, 66700, 66650],
  eth: [2045, 2038, 2032, 2028, 2025, 2030, 2022, 2020],
  sol: [84.2, 83.9, 83.6, 83.4, 83.5, 83.3, 83.2, 83.1],
};

// ─── Данные агента в памяти ───────────────────────────────────────────────────
let agentData = {
  btcPrice: 0, ethPrice: 0, solPrice: 0,
  decisions: { btc: "WAIT", eth: "WAIT", sol: "WAIT" },
  decision: "WAIT",
  reasoning: "Агент запускается...",
  balance: 0, buyCount: 0, sellCount: 0, waitCount: 0, totalTx: 0,
  lastUpdate: new Date().toISOString(),
  transactions: [],
  walletAddress: "",
  contractAddress: "AiPbAtUTRhT1bBSeoLTNgN5ajibLKg2KeHQj4gX4ZYe9",
  trends: { btc: "", eth: "", sol: "" },
  volatility: { btc: "LOW", eth: "LOW", sol: "LOW" },
  status: "starting",
};

// ─── HTTP сервер ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }

  if (req.url === "/api/agent" || req.url === "/") {
    res.writeHead(200);
    res.end(JSON.stringify(agentData));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`✅ HTTP сервер: http://localhost:${PORT}/api/agent`);
});

function loadWallet() {
  const secret = JSON.parse(fs.readFileSync("wallet.json"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

// ─── FIX 1: Таймаут на CoinGecko fetch ───────────────────────────────────────
async function getPrices() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd",
      { signal: controller.signal }
    );
    const data = await res.json();
    if (!data.bitcoin?.usd || !data.ethereum?.usd || !data.solana?.usd) {
      throw new Error("Неполные данные от CoinGecko");
    }
    return { btc: data.bitcoin.usd, eth: data.ethereum.usd, sol: data.solana.usd };
  } finally {
    clearTimeout(timeout);
  }
}

function getTrend(history) {
  if (history.length < 2) return "недостаточно данных";
  const first = history[0];
  const last = history[history.length - 1];
  const change = ((last - first) / first) * 100;
  const direction = change > 0.1 ? "РОСТ" : change < -0.1 ? "ПАДЕНИЕ" : "ФЛЕТ";
  return `${direction} ${change.toFixed(3)}% за ${history.length} проверок`;
}

function getVolatility(history) {
  if (history.length < 3) return "LOW";
  const changes = [];
  for (let i = 1; i < history.length; i++) {
    changes.push(Math.abs((history[i] - history[i - 1]) / history[i - 1]) * 100);
  }
  const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
  if (avg > 1) return "HIGH";
  if (avg > 0.3) return "MEDIUM";
  return "LOW";
}

// ─── FIX 2: Надёжный парсинг AI ответа + таймаут на Groq ─────────────────────
async function askAI(prices) {
  const btcHistory = priceHistory.btc.slice(-6).map(p => `$${p.toLocaleString()}`).join(" → ");
  const ethHistory = priceHistory.eth.slice(-6).map(p => `$${p.toLocaleString()}`).join(" → ");
  const solHistory = priceHistory.sol.slice(-6).map(p => `$${p.toLocaleString()}`).join(" → ");

  // Таймаут на Groq — 15 секунд
  const groqPromise = groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Ты автономный AI торговый агент на блокчейне Solana. Твои решения записываются on-chain навсегда.

Отвечай СТРОГО в этом формате (никаких отклонений):
BTC: BUY
ETH: SELL
SOL: WAIT
REASON: текст на русском 2-3 предложения

Допустимые значения: BUY, SELL, WAIT — только эти три слова.
REASON пиши ТОЛЬКО на русском, конкретно упоминай цены и тренды.
Не бойся давать BUY или SELL — нерешительность это плохо.`,
      },
      {
        role: "user",
        content: `Рыночные данные:
BTC: $${prices.btc.toLocaleString()} | История: ${btcHistory} | Тренд: ${getTrend(priceHistory.btc)} | Волатильность: ${getVolatility(priceHistory.btc)}
ETH: $${prices.eth.toLocaleString()} | История: ${ethHistory} | Тренд: ${getTrend(priceHistory.eth)} | Волатильность: ${getVolatility(priceHistory.eth)}
SOL: $${prices.sol.toLocaleString()} | История: ${solHistory} | Тренд: ${getTrend(priceHistory.sol)} | Волатильность: ${getVolatility(priceHistory.sol)}`,
      },
    ],
    max_tokens: 250,
    temperature: 0.4,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Groq timeout")), 15000)
  );

  const response = await Promise.race([groqPromise, timeoutPromise]);
  const text = response.choices[0].message.content.trim();
  const upper = text.toUpperCase();

  // FIX 2: Улучшенный парсинг — ищем BUY/SELL/WAIT после названия монеты
  const parse = (coin) => {
    // Пробуем разные форматы: "BTC: BUY", "BTC - BUY", "BTC BUY"
    const patterns = [
      new RegExp(`${coin}[:\\s\\-]+\\s*(BUY|SELL|WAIT)`, "i"),
      new RegExp(`(BUY|SELL|WAIT)[:\\s\\-]+\\s*${coin}`, "i"),
    ];
    for (const pattern of patterns) {
      const match = upper.match(pattern);
      if (match) {
        // Возвращаем именно BUY/SELL/WAIT а не название монеты
        const val = match[1];
        if (["BUY", "SELL", "WAIT"].includes(val)) return val;
      }
    }
    // Логируем если не распарсили
    console.log(`  ⚠️ Не удалось распарсить решение для ${coin}, используем WAIT`);
    return "WAIT";
  };

  const reasonMatch = text.match(/REASON:\s*(.+)/is);
  const reasoning = reasonMatch ? reasonMatch[1].trim() : "Анализирую рыночные условия...";

  console.log(`  → AI ответ: ${text.replace(/\n/g, " | ")}`);

  return {
    decisions: { btc: parse("BTC"), eth: parse("ETH"), sol: parse("SOL") },
    reasoning,
  };
}

function getProvider(wallet) {
  return new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), { commitment: "confirmed" });
}

function loadIDL() {
  return JSON.parse(fs.readFileSync("./hunters-contract/target/idl/hunters_contract.json", "utf8"));
}

async function runAgent() {
  const wallet = loadWallet();
  const provider = getProvider(wallet);
  const idl = loadIDL();
  const program = new anchor.Program(idl, provider);

  let stateKeypair;
  if (fs.existsSync("state-account.json")) {
    const secret = JSON.parse(fs.readFileSync("state-account.json"));
    stateKeypair = Keypair.fromSecretKey(Uint8Array.from(secret));
    console.log("Загружаем существующий state аккаунт...");
  } else {
    stateKeypair = Keypair.generate();
    fs.writeFileSync("state-account.json", JSON.stringify(Array.from(stateKeypair.secretKey)));
    console.log("Инициализируем смарт-контракт...");
    await program.methods.initialize()
      .accounts({ state: stateKeypair.publicKey, authority: wallet.publicKey })
      .signers([stateKeypair]).rpc();
    console.log("Смарт-контракт инициализирован!");
  }

  console.log("State account:", stateKeypair.publicKey.toString());
  console.log("AI Агент запущен! Мониторинг: BTC + ETH + SOL");
  console.log("Кошелёк:", wallet.publicKey.toString());
  console.log("─".repeat(50));

  agentData.walletAddress = wallet.publicKey.toString();
  agentData.status = "running";

  const transactionLog = [];
  let isRunning = false; // FIX 3: защита от race condition

  while (true) {
    // FIX 3: Пропускаем цикл если предыдущий ещё не завершился
    if (isRunning) {
      console.log("  ⚠️ Предыдущий цикл ещё выполняется, пропускаем...");
      await new Promise((r) => setTimeout(r, 30000));
      continue;
    }

    isRunning = true;
    try {
      const prices = await getPrices();
      const balance = await connection.getBalance(wallet.publicKey);
      const balanceSOL = balance / LAMPORTS_PER_SOL;
      const time = new Date().toLocaleTimeString();

      priceHistory.btc.push(prices.btc);
      priceHistory.eth.push(prices.eth);
      priceHistory.sol.push(prices.sol);
      if (priceHistory.btc.length > 10) priceHistory.btc.shift();
      if (priceHistory.eth.length > 10) priceHistory.eth.shift();
      if (priceHistory.sol.length > 10) priceHistory.sol.shift();

      console.log(`\n[${time}]`);
      console.log(`  BTC: $${prices.btc.toLocaleString()} | ${getTrend(priceHistory.btc)}`);
      console.log(`  ETH: $${prices.eth.toLocaleString()} | ${getTrend(priceHistory.eth)}`);
      console.log(`  SOL: $${prices.sol.toLocaleString()} | ${getTrend(priceHistory.sol)}`);

      const { decisions, reasoning } = await askAI(prices);
      console.log(`  → BTC=${decisions.btc} ETH=${decisions.eth} SOL=${decisions.sol}`);

      const txSig = await program.methods
        .recordDecision(new anchor.BN(prices.btc), decisions.btc)
        .accounts({ state: stateKeypair.publicKey, authority: wallet.publicKey })
        .rpc();

      console.log(`  → On-chain TX: ${txSig.slice(0, 20)}...`);

      // FIX 4: Валидируем данные из контракта
      let buyCount = 0, sellCount = 0, waitCount = 0, totalTransactions = 0;
      try {
        const state = await program.account.agentState.fetch(stateKeypair.publicKey);
        buyCount = Number(state.buyCount);
        sellCount = Number(state.sellCount);
        waitCount = Number(state.waitCount);
        totalTransactions = Number(state.totalTransactions);
      } catch (stateErr) {
        console.log("  ⚠️ Не удалось прочитать state контракта:", stateErr.message);
      }

      console.log(`  → BUY=${buyCount} SELL=${sellCount} WAIT=${waitCount} | Total: ${totalTransactions}`);

      // Все три монеты в лог
      const priceMap = { btc: prices.btc, eth: prices.eth, sol: prices.sol };
      for (const coin of ["btc", "eth", "sol"]) {
        transactionLog.unshift({
          id: `${Date.now()}-${coin}`,
          time,
          coin: coin.toUpperCase(),
          decision: decisions[coin],
          price: priceMap[coin],
          txHash: txSig,
        });
      }
      if (transactionLog.length > 50) transactionLog.splice(50);

      agentData = {
        btcPrice: prices.btc, ethPrice: prices.eth, solPrice: prices.sol,
        decisions, decision: decisions.btc, reasoning,
        balance: balanceSOL,
        buyCount, sellCount, waitCount, totalTx: totalTransactions,
        lastUpdate: new Date().toISOString(),
        transactions: transactionLog,
        walletAddress: wallet.publicKey.toString(),
        contractAddress: "AiPbAtUTRhT1bBSeoLTNgN5ajibLKg2KeHQj4gX4ZYe9",
        trends: {
          btc: getTrend(priceHistory.btc),
          eth: getTrend(priceHistory.eth),
          sol: getTrend(priceHistory.sol),
        },
        volatility: {
          btc: getVolatility(priceHistory.btc),
          eth: getVolatility(priceHistory.eth),
          sol: getVolatility(priceHistory.sol),
        },
        status: "running",
      };

      // Сохраняем в файл для локальной разработки
      fs.writeFileSync("agent-data.json", JSON.stringify(agentData, null, 2));

    } catch (e) {
      console.log("  → Ошибка:", e.message);
      agentData.status = "error";
    } finally {
      isRunning = false;
    }

    await new Promise((r) => setTimeout(r, 30000));
  }
}

runAgent();