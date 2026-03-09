# portfolio-ta

Portfolio Technical Analysis tool using the [Massive.com](https://massive.com) REST API.

Fetches real-time prices + technical indicators (RSI, MACD, SMA, EMA) for a portfolio of stocks, ETFs, crypto, and indices, then outputs a clean TA summary.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and set your MASSIVE_API_KEY
```

## Usage

```bash
# Analyse all portfolio assets
npm run ta

# Single ticker
npx ts-node src/index.ts --ticker RSP

# JSON output
npx ts-node src/index.ts --all --json
```

## Portfolio

Tracks: RSP, GLDM, SLV, JEPI, TSLA, NVDA, MSFT, GOOG, AMZN, PLTR, RKLB, SMH, MU, TSM, EWY, V, PAVE, XLU, COPX, XAR, UFO, URA, SHLD, BTC, BNB, SPX, VIX

## Signals

| Signal | Criteria |
|--------|----------|
| STRONG BUY | RSI oversold + MACD bullish + above SMAs |
| BUY | 2+ bullish signals |
| HOLD | Mixed signals |
| SELL | 2+ bearish signals |
| STRONG SELL | RSI overbought + MACD bearish + below SMAs |

## API

Powered by [Massive.com REST API](https://massive.com/docs/rest/quickstart).
Indicators: SMA (20/50), EMA (20), RSI (14), MACD (12/26/9).
