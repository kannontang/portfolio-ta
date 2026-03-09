# portfolio-ta

**Portfolio Management & Technical Analysis Tool**

A comprehensive portfolio tracker with PostgreSQL database, real-time price syncing, and technical analysis powered by Massive.com API.

## Features

- 📊 **Portfolio Management** — Track holdings across multiple exchanges (Binance, IB, Futu, Cash)
- 💰 **Real-time Pricing** — Fetch latest prices for stocks, ETFs, and crypto
- 📈 **Technical Analysis** — RSI, MACD, SMA, EMA indicators for all assets
- 📉 **Historical Tracking** — Portfolio value snapshots over time with P&L calculation
- 🗄️ **PostgreSQL Database** — Persistent storage for holdings, prices, and snapshots

## Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and set MASSIVE_API_KEY and DATABASE_URL

# Create database (if not exists)
psql -U korbin -c "CREATE DATABASE portfolio;"

# Run migrations
npx prisma migrate dev

# Seed initial portfolio data
pnpm seed
```

## Usage

### Portfolio Management

```bash
# View all holdings
pnpm portfolio

# Sync prices and calculate portfolio value
pnpm sync

# Add or update a holding
pnpm holding:add -- --symbol AAPL --quantity 10 --cost 150 --exchange FUTU --type STOCK --name "Apple Inc"

# View portfolio value history (last 30 days)
pnpm history

# Custom time range
pnpm history -- --days 7
```

### Technical Analysis

```bash
# Analyze all portfolio assets
pnpm ta

# Single ticker analysis
pnpm ta:ticker -- --ticker NVDA

# JSON output
pnpm ta -- --all --json
```

## Database Schema

### Asset
- Holdings across all exchanges
- Tracks quantity, average cost, type (CASH/CRYPTO/STOCK/ETF)

### PriceHistory
- Historical price snapshots for each asset
- Source tracking (Massive API, fixed rate, etc.)

### PortfolioSnapshot
- Total portfolio value over time
- Breakdown by asset type (cash, crypto, stocks)

### Alert
- Price alerts (above/below/percent change)
- Trigger tracking

## Portfolio Tracked

**Cash & Stablecoins:** Futu USD, IB HKD, Binance USDT

**Crypto:** BTC, BNB

**Stocks/ETFs:** GLDM, TSLA, V, AMZN, NVDA, MSFT, GOOG, PLTR, RKLB, JEPI, and more

## API

Powered by [Massive.com REST API](https://massive.com/docs/rest/quickstart).

Indicators: SMA (20/50), EMA (20), RSI (14), MACD (12/26/9).

## Tech Stack

- **Backend:** TypeScript + Node.js
- **Database:** PostgreSQL + Prisma ORM
- **Price API:** Massive.com (stocks, ETFs, crypto, indices)
- **CLI:** ts-node for rapid execution

## Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm portfolio` | View all holdings |
| `pnpm sync` | Fetch latest prices & calculate value |
| `pnpm holding:add` | Add/update holding |
| `pnpm history` | View portfolio value history |
| `pnpm ta` | Technical analysis (all assets) |
| `pnpm ta:ticker` | TA for single ticker |
| `pnpm seed` | Seed initial portfolio data |

## Framework Versions

### v1.0 (2026-03-09)
- Initial release with portfolio management
- PostgreSQL database integration
- Price syncing from Massive.com API
- Historical tracking with snapshots
- Technical analysis (existing feature preserved)

---

Built for Korbin's portfolio tracking needs. 🎐
