# Portfolio TA Tool

## Project Overview
Build a Node.js CLI tool that fetches technical analysis data for a portfolio of assets using the Massive.com REST API, and outputs a concise TA summary.

## API Details
- Base URL: `https://api.massive.com/v3`
- API Key: Read from `.env` file (MASSIVE_API_KEY)
- Auth: Query param `?apiKey=KEY` or Header `Authorization: Bearer KEY`

## Available Endpoints (from docs)
- **Aggregate Bars (OHLC)**: `/v3/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}`
- **Snapshots**: `/v3/snapshot/locale/us/markets/stocks/tickers/{ticker}` (current price)
- **Technical Indicators**:
  - SMA: `/v3/indicators/sma/{ticker}`
  - EMA: `/v3/indicators/ema/{ticker}`
  - MACD: `/v3/indicators/macd/{ticker}`
  - RSI: `/v3/indicators/rsi/{ticker}`
- **Crypto**: `/v3/snapshot/locale/global/markets/crypto/tickers/{ticker}` (for BTC, BNB)
- **Indices**: Check `/v3/snapshot/locale/us/markets/indices/tickers/{ticker}` (for VIX, SPX)

## Portfolio Assets to Track
### Stocks/ETFs:
RSP, GLDM, SLV, TSLA, V, JEPI, SMH, PLTR, NVDA, MSFT, RKLB, AMZN, XAR, URA, UFO, MU, GOOG, SHLD, COPX, PAVE, XLU, EWY, TSM

### Crypto:
BTC (as X:BTCUSD), BNB (as X:BNBUSD)

### Indices:
VIX (as I:VIX), SPX (as I:SPX)

## Requirements

### 1. `src/config.ts`
- Load .env for API key
- Define portfolio assets list with categories

### 2. `src/api.ts`
- Wrapper functions for Massive API calls
- getSnapshot(ticker) — current price
- getAggBars(ticker, timespan, from, to) — OHLC bars
- getRSI(ticker, window?) — RSI indicator
- getMACD(ticker) — MACD indicator
- getSMA(ticker, window) — SMA
- getEMA(ticker, window) — EMA
- Rate limiting (max 5 requests/sec)

### 3. `src/analysis.ts`
- For each asset, fetch:
  - Current price (snapshot)
  - RSI (14-day)
  - MACD (12, 26, 9)
  - SMA 20 & SMA 50
  - EMA 20
- Determine signal: BUY / SELL / HOLD based on:
  - RSI < 30 = oversold (BUY signal)
  - RSI > 70 = overbought (SELL signal)
  - MACD crossover (bullish/bearish)
  - Price vs SMA20/SMA50 (above = bullish, below = bearish)

### 4. `src/output.ts`
- Format results as a clean table
- Output JSON file: `output/ta-report.json`
- Output text summary: `output/ta-report.txt`

### 5. `src/index.ts`
- Main entry: run analysis for all assets
- CLI flags: `--ticker RSP` (single), `--all` (all assets), `--json` (JSON output)

### 6. `package.json`
- Use TypeScript
- Dependencies: dotenv, node-fetch (or built-in fetch if Node 18+)
- Scripts: `npm run build`, `npm run ta` (run analysis)

### 7. `.env.example`
```
MASSIVE_API_KEY=your_api_key_here
```

## Output Format Example
```
=== Portfolio TA Report (2026-03-09) ===

Ticker  Price    RSI    MACD Signal  SMA20   SMA50   Signal
RSP     $193.60  28.5   Bearish      $198    $205    BUY (oversold)
NVDA    $177.89  35.2   Bearish      $185    $195    HOLD
TSLA    $396.73  42.1   Bearish      $410    $420    HOLD
...

=== Summary ===
BUY signals: RSP, COPX, URA
SELL signals: PLTR
HOLD: everything else
```

## Important
- Handle API errors gracefully (rate limits, missing data)
- Use TypeScript strict mode
- Keep it simple and minimal
- The tool should be runnable with `npx ts-node src/index.ts --all`
- Create a GitHub repo readme
