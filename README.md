# 🤖 Hunters Contracts

<div align="center">

![Hunters Contracts Banner](https://img.shields.io/badge/Hunters_Contracts-AI_×_Blockchain-9945FF?style=for-the-badge&logo=solana&logoColor=white)

**Автономный AI торговый агент на блокчейне Solana**

[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=flat-square&logo=solana)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-Framework-9945FF?style=flat-square)](https://anchor-lang.com)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_70B-FF4560?style=flat-square)](https://groq.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<!-- Замените # на реальные ссылки перед сдачей -->
[📹 Demo Video](https://youtu.be/wGgmvdY7sSU) · [💬 Telegram Bot](https://github.com/MrHunter-lead/Hunters-Contract-Bot)

---

> **Decentrathon 2026** · Track: AI + Blockchain: Autonomous Smart Contracts · Team: **Malware Hunters** 🇰🇿

</div>

---

## 🎯 Проблема

Сегодня DeFi-трейдинг разорван на две несовместимые части:

**Смарт-контракты** — прозрачны и верифицируемы, но работают только по жёстко заданным правилам (`if price > X → sell`), не умеют читать рынок и реагировать на контекст.

**AI-модели** — умеют анализировать тренды, волатильность и паттерны, но их решения существуют только внутри black box: никакой верификации, никакого аудита, никакой истории on-chain.

Итог: либо прозрачность без интеллекта, либо интеллект без прозрачности. Одновременно — невозможно.

## 💡 Решение

**Hunters Contracts** — первый шаг к закрытию этого разрыва.

```
Рынок → AI анализ → Решение → On-chain запись → Прозрачность
```

Каждые 30 секунд LLaMA 70B анализирует рынок и принимает решение. Это решение — вместе с ценой и обоснованием — **навсегда записывается в смарт-контракт Solana**. Прозрачно, неизменно, верифицируемо.

> ⚠️ **Важно:** проект запущен на **Solana Devnet** — реальных денег не задействовано. Это proof-of-concept архитектуры, а не production trading bot.

---

## ⚡ Как это работает

```
┌─────────────────────────────────────────────────────────────┐
│                    HUNTERS CONTRACTS                         │
│                                                             │
│  CoinGecko API                                              │
│  BTC / ETH / SOL  ──►  Node.js Agent  ──►  Groq LLaMA 70B  │
│  (каждые 30 сек)           │                     │          │
│                            │              BUY/SELL/WAIT     │
│                            │              + Reasoning       │
│                            ▼                     │          │
│                   Solana Smart Contract  ◄────────┘          │
│                   (Anchor Framework)                        │
│                            │                                │
│                            ▼                                │
│                    Next.js Dashboard                        │
│                   (Live Intelligence)                       │
└─────────────────────────────────────────────────────────────┘
```

### Шаг 1 — Мониторинг 📡
Агент получает актуальные цены **BTC, ETH и SOL** через CoinGecko API каждые 30 секунд. Строит историю цен и анализирует тренды.

### Шаг 2 — AI Анализ 🧠
**Groq LLaMA 3.3 70B** получает:
- Текущие цены и историю последних 10 проверок
- Направление тренда (РОСТ / ПАДЕНИЕ / ФЛЕТ)
- Уровень волатильности (LOW / MEDIUM / HIGH)

И принимает решение **BUY / SELL / WAIT** с обоснованием на русском языке.

### Шаг 3 — On-Chain запись ⛓️
Решение AI немедленно записывается в **смарт-контракт на Solana** через Anchor Framework. Транзакция необратима и верифицируема.

### Шаг 4 — Дашборд 📊
Live дашборд показывает все данные в реальном времени: цены, решения AI, reasoning, статистику и лог транзакций.

---

## 🏗️ Архитектура

```
Hunters Contracts/
├── agent.js                    # AI агент (Node.js)
│   ├── HTTP сервер (порт 3001) # API для фронтенда
│   ├── CoinGecko интеграция    # Получение цен
│   ├── Groq LLaMA 70B          # AI решения
│   └── Solana транзакции       # On-chain запись
│
├── hunters-contract/           # Смарт-контракт (Rust + Anchor)
│   └── programs/
│       └── hunters-contract/
│           └── src/lib.rs      # Логика контракта
│
└── frontend/                   # Дашборд (Next.js 16)
    ├── app/
    │   ├── page.tsx            # Главная страница
    │   └── api/
    │       ├── agent/route.ts  # Прокси к агенту
    │       └── assistant/route.ts # AI чат-ассистент
    └── components/hunters/
        ├── dashboard-section   # Live данные
        ├── trading-chart       # Свечной график
        ├── ai-reasoning        # Объяснение AI
        └── contracts-assistant # Чат с AI
```

---

## 🛠️ Технологический стек

| Компонент | Технология | Назначение |
|-----------|-----------|------------|
| **Блокчейн** | Solana | Быстрые дешёвые транзакции |
| **Смарт-контракт** | Anchor Framework (Rust) | On-chain логика |
| **AI Модель** | Groq LLaMA 3.3 70B | Анализ рынка и решения |
| **Цены** | CoinGecko API | BTC/ETH/SOL в реальном времени |
| **Агент** | Node.js | Оркестрация всей системы |
| **Фронтенд** | Next.js 16 + TypeScript | Live дашборд |
| **Стили** | Tailwind CSS | UI компоненты |

---

## 📋 Smart Contract

**Program ID:** `AiPbAtUTRhT1bBSeoLTNgN5ajibLKg2KeHQj4gX4ZYe9`

```rust
#[account]
pub struct AgentState {
    pub buy_count: u64,        // Количество BUY решений
    pub sell_count: u64,       // Количество SELL решений  
    pub wait_count: u64,       // Количество WAIT решений
    pub last_price: u64,       // Последняя цена BTC
    pub last_action: String,   // Последнее решение AI
    pub total_transactions: u64, // Всего транзакций
}
```

**Методы контракта:**
- `initialize()` — инициализация state аккаунта
- `record_decision(price: u64, action: String)` — запись решения AI on-chain

---

## 🚀 Запуск локально

### Требования
- Node.js 18+
- Rust + Anchor CLI
- Solana CLI
- WSL (для Windows)

### 1. Клонируй репозиторий
```bash
git clone https://github.com/YOUR_USERNAME/hunters-contracts.git
cd hunters-contracts
```

### 2. Установи зависимости
```bash
npm install
cd frontend && npm install
```

### 3. Настрой переменные окружения

Создай `.env` в корне:
```env
RPC_URL=http://127.0.0.1:8899
GROQ_API_KEY=your_groq_api_key
```

Создай `frontend/.env.local`:
```env
GROQ_API_KEY=your_groq_api_key
```

### 4. Запусти Solana локальный валидатор (WSL)
```bash
solana-test-validator
```

### 5. Задеплой смарт-контракт (WSL)
```bash
cd hunters-contract
anchor deploy
```

### 6. Запусти AI агента
```bash
# В корне проекта
node agent.js
```

Агент запустится и поднимет HTTP сервер на `http://localhost:3001`

### 7. Запусти фронтенд
```bash
cd frontend
npm run dev
```

Открой `http://localhost:3000` 🎉

---

## 🎮 Функционал дашборда

| Фича | Описание |
|------|----------|
| **Live Prices** | Реальные цены BTC/ETH/SOL с мини-графиками |
| **AI Decisions** | Решения агента BUY/SELL/WAIT для каждой монеты |
| **AI Reasoning** | Объяснение решений на русском языке от LLaMA 70B |
| **Trading Chart** | Свечной график с OHLC данными и кроссхером |
| **Statistics** | On-chain статистика: BUY/SELL/WAIT counts |
| **Transaction Log** | Лог всех решений с хешами транзакций |
| **Contracts Assistant** | AI чат-бот для вопросов о крипте и Solana |
| **Telegram Bot** | Уведомления о сигналах в Telegram |

---

## 🔑 Ключевые особенности

### Почему Solana?

Выбор Solana — не маркетинг, а технический расчёт под конкретную задачу:

- **Финальность транзакции ~400 мс** — агент принимает решение каждые 30 секунд, on-chain запись успевает до следующего цикла без задержек
- **Комиссия ~0.000005 SOL (~$0.001)** — при 2880 транзакциях в сутки (каждые 30 сек) расход на газ составляет ~$3/месяц, что делает частые записи экономически разумными
- **Anchor Framework** — типобезопасный Rust-фреймворк с автоматической проверкой аккаунтов, снижает риск типичных смарт-контракт уязвимостей

> Ethereum с теми же параметрами стоил бы в 100–1000 раз дороже. Arbitrum/Polygon дешевле, но без нативной экосистемы Anchor.

### Автономность
Агент работает **полностью автономно** 24/7:
- Нет ручного вмешательства
- Нет централизованного контроля
- Каждое решение записывается on-chain навсегда

### Прозрачность AI
AI принимает финансовые решения **с полным аудитом**:
- Каждое решение верифицируемо on-chain
- Reasoning (обоснование) сохраняется вместе с решением
- История решений неизменна — никто не может переписать что агент "думал"

---



## 👥 Команда — Malware Hunters 🇰🇿

Команда разработчиков из Казахстана, Decentrathon 2026.

| Telegram | Роль |
|----------|------|
| [@runshell](https://t.me/runshell) | Blockchain · Smart Contracts · Anchor |
| [@tg_mogila](https://t.me/tg_mogil) | AI · Node.js Agent · Frontend |

> *"Hunters Contracts — переход от идей к системе."*

---

## 📄 Лицензия

MIT License — [LICENSE](LICENSE)

---

<div align="center">

**Hunters Contracts** · Decentrathon 2026 · Team Malware Hunters 🇰🇿

[![Solana](https://img.shields.io/badge/Built_on-Solana-9945FF?style=for-the-badge&logo=solana)](https://solana.com)
[![Groq](https://img.shields.io/badge/Powered_by-LLaMA_70B-14F195?style=for-the-badge)](https://groq.com)

</div>
