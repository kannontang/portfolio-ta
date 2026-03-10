import { Asset } from './config';
import { getSnapshot, getRSI, getMACD, getSMA, getEMA } from './api';

export type Signal = 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL' | 'N/A';

export interface TAResult {
  ticker: string;
  name: string;
  category: string;
  price: number | null;
  changePercent: number | null;
  rsi: number | null;
  macdHistogram: number | null;
  macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | null;
  sma20: number | null;
  sma50: number | null;
  ema20: number | null;
  priceVsSma20: 'ABOVE' | 'BELOW' | null;
  priceVsSma50: 'ABOVE' | 'BELOW' | null;
  signal: Signal;
  notes: string[];
}

function determineSignal(rsi: number | null, macdHist: number | null, priceVsSma20: string | null, priceVsSma50: string | null): { signal: Signal; notes: string[] } {
  const notes: string[] = [];
  let bullish = 0;
  let bearish = 0;

  if (rsi !== null) {
    if (rsi < 30) { notes.push(`RSI ${rsi.toFixed(1)} — oversold`); bullish += 2; }
    else if (rsi < 40) { notes.push(`RSI ${rsi.toFixed(1)} — weak`); bullish += 1; }
    else if (rsi > 70) { notes.push(`RSI ${rsi.toFixed(1)} — overbought`); bearish += 2; }
    else if (rsi > 60) { notes.push(`RSI ${rsi.toFixed(1)} — strong`); bearish += 1; }
    else notes.push(`RSI ${rsi.toFixed(1)} — neutral`);
  }

  if (macdHist !== null) {
    if (macdHist > 0) { notes.push('MACD bullish'); bullish += 1; }
    else if (macdHist < 0) { notes.push('MACD bearish'); bearish += 1; }
  }

  if (priceVsSma20 === 'ABOVE') { notes.push('Above SMA20'); bullish += 1; }
  else if (priceVsSma20 === 'BELOW') { notes.push('Below SMA20'); bearish += 1; }

  if (priceVsSma50 === 'ABOVE') { notes.push('Above SMA50'); bullish += 1; }
  else if (priceVsSma50 === 'BELOW') { notes.push('Below SMA50'); bearish += 1; }

  let signal: Signal;
  const score = bullish - bearish;
  if (score >= 4) signal = 'STRONG BUY';
  else if (score >= 2) signal = 'BUY';
  else if (score <= -4) signal = 'STRONG SELL';
  else if (score <= -2) signal = 'SELL';
  else signal = 'HOLD';

  return { signal, notes };
}

export async function analyzeAsset(asset: Asset): Promise<TAResult> {
  const result: TAResult = {
    ticker: asset.ticker,
    name: asset.name,
    category: asset.category,
    price: null,
    changePercent: null,
    rsi: null,
    macdHistogram: null,
    macdSignal: null,
    sma20: null,
    sma50: null,
    ema20: null,
    priceVsSma20: null,
    priceVsSma50: null,
    signal: 'N/A',
    notes: [],
  };

  // Run TA for stocks and crypto (indices may not support all indicators)
  const runTA = asset.market === 'stocks' || asset.market === 'crypto';
  const [snap, rsiRes, macdRes, sma20Res, sma50Res, ema20Res] = await Promise.all([
    getSnapshot(asset.ticker, asset.market),
    runTA ? getRSI(asset.ticker) : Promise.resolve({ ticker: asset.ticker, values: [] }),
    runTA ? getMACD(asset.ticker) : Promise.resolve({ ticker: asset.ticker, values: [] }),
    runTA ? getSMA(asset.ticker, 20) : Promise.resolve({ ticker: asset.ticker, values: [] }),
    runTA ? getSMA(asset.ticker, 50) : Promise.resolve({ ticker: asset.ticker, values: [] }),
    runTA ? getEMA(asset.ticker, 20) : Promise.resolve({ ticker: asset.ticker, values: [] }),
  ]);

  result.price = snap.price;
  result.changePercent = snap.changePercent;

  if (rsiRes.values.length > 0) result.rsi = rsiRes.values[0].value;
  if (macdRes.values.length > 0) {
    const m = (macdRes as any).values[0];
    result.macdHistogram = m.histogram;
    result.macdSignal = m.histogram > 0 ? 'BULLISH' : m.histogram < 0 ? 'BEARISH' : 'NEUTRAL';
  }
  if (sma20Res.values.length > 0) result.sma20 = sma20Res.values[0].value;
  if (sma50Res.values.length > 0) result.sma50 = sma50Res.values[0].value;
  if (ema20Res.values.length > 0) result.ema20 = ema20Res.values[0].value;

  if (result.price !== null && result.sma20 !== null)
    result.priceVsSma20 = result.price > result.sma20 ? 'ABOVE' : 'BELOW';
  if (result.price !== null && result.sma50 !== null)
    result.priceVsSma50 = result.price > result.sma50 ? 'ABOVE' : 'BELOW';

  const { signal, notes } = determineSignal(result.rsi, result.macdHistogram, result.priceVsSma20, result.priceVsSma50);
  result.signal = signal;
  result.notes = notes;

  return result;
}
