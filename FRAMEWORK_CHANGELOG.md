# Portfolio Tracker — Framework Changelog

This file tracks major framework changes and versions for easy comparison.

---

## v1.0 — Initial Portfolio Management System (2026-03-09)

### Architecture
- **Database:** PostgreSQL (`portfolio` database)
- **ORM:** Prisma 5.22.0
- **Language:** TypeScript + Node.js
- **Package Manager:** pnpm

### Database Schema

#### Asset
```prisma
model Asset {
  id           String         @id @default(cuid())
  symbol       String         @unique
  name         String
  type         AssetType      // CASH, STABLECOIN, CRYPTO, STOCK, ETF
  exchange     Exchange       // CASH, BINANCE, IB, FUTU
  quantity     Float
  avgCost      Float?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  priceHistory PriceHistory[]
  alerts       Alert[]
}
```

#### PriceHistory
```prisma
model PriceHistory {
  id        String   @id @default(cuid())
  assetId   String
  asset     Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  price     Float
  currency  String   @default("USD")
  timestamp DateTime @default(now())
  source    String   @default("massive")
}
```

#### PortfolioSnapshot
```prisma
model PortfolioSnapshot {
  id          String   @id @default(cuid())
  totalValue  Float
  cashValue   Float
  cryptoValue Float
  stockValue  Float
  timestamp   DateTime @default(now())
}
```

#### Alert
```prisma
model Alert {
  id        String    @id @default(cuid())
  assetId   String
  asset     Asset     @relation(fields: [assetId], references: [id], onDelete: Cascade)
  type      AlertType // ABOVE, BELOW, PCT_CHANGE
  threshold Float
  triggered Boolean   @default(false)
  createdAt DateTime  @default(now())
}
```

### CLI Commands

| Command | File | Purpose |
|---------|------|---------|
| `pnpm portfolio` | `src/commands/portfolio.ts` | View all holdings grouped by exchange |
| `pnpm sync` | `src/commands/sync.ts` | Fetch latest prices, save to PriceHistory, create PortfolioSnapshot |
| `pnpm add` | `src/commands/add.ts` | Add new holding or update existing |
| `pnpm history` | `src/commands/history.ts` | View portfolio value over time with P&L |
| `pnpm ta` | `src/index.ts` | Technical analysis (RSI, MACD, SMA, EMA) for all assets |
| `pnpm ta:ticker` | `src/index.ts` | TA for single ticker |
| `pnpm seed` | `prisma/seed.ts` | Seed initial portfolio data |

### Price Data Sources
- **Stocks/ETFs:** Massive.com API (`/snapshot/locale/us/markets/stocks/tickers/{ticker}`)
- **Crypto:** Massive.com API (`/snapshot/locale/global/markets/crypto/tickers/{ticker}`)
- **Cash/Stablecoins:** Fixed rate (1.0 USD or avgCost)

### Initial Portfolio (Seeded)
- **24 assets** across 3 exchanges (Binance, IB, Futu) + Cash
- **Total value:** ~$86,741 USD (as of 2026-02-26)
- **Allocation:** 27.65% cash, 12.48% crypto, 59.87% stocks/ETFs

### Technical Analysis Features (Preserved from Original)
- RSI (14-day)
- MACD (12/26/9)
- SMA (20/50)
- EMA (20)
- Signal generation: STRONG BUY, BUY, HOLD, SELL, STRONG SELL

### File Structure
```
portfolio-ta/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Initial portfolio data
│   └── migrations/            # Database migrations
├── src/
│   ├── commands/
│   │   ├── portfolio.ts       # View holdings
│   │   ├── sync.ts            # Price sync + snapshot
│   │   ├── add.ts             # Add/update holding
│   │   └── history.ts         # Value history
│   ├── api.ts                 # Massive.com API wrapper
│   ├── analysis.ts            # TA logic
│   ├── config.ts              # Portfolio config
│   ├── index.ts               # TA CLI entry
│   └── output.ts              # TA report formatting
├── .env                       # Environment variables
├── package.json               # Dependencies + scripts
├── tsconfig.json              # TypeScript config
└── README.md                  # Documentation
```

### Dependencies
```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "dotenv": "^16.0.3",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "prisma": "^5.22.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.0"
  }
}
```

### Key Design Decisions
1. **Separate symbols for same stock on different exchanges** (e.g., `TSLA` vs `TSLA_IB`) to track cost basis independently
2. **Fixed price for cash/stablecoins** to avoid unnecessary API calls
3. **Snapshot-based value tracking** for historical comparison and P&L calculation
4. **Preserved original TA functionality** — existing `pnpm ta` commands still work
5. **Prisma 5 instead of 7** — v7 had breaking API changes, v5 is stable

### Future Enhancements (Not Yet Implemented)
- Cron job for automatic price syncing
- Alert system (price above/below threshold)
- Web UI for portfolio visualization
- Export to CSV/Excel
- Integration with broker APIs (Futu, IB) for automatic sync
- Multi-currency support (HKD, EUR, etc.)

---

## How to Compare Versions

When a new version is released:
1. Check this file for schema changes
2. Run `git diff v1.0..v2.0 prisma/schema.prisma` to see database changes
3. Compare CLI commands and their behavior
4. Review migration files in `prisma/migrations/`

---

**Last Updated:** 2026-03-09 by Kannon 🎐
