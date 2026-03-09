import { API_KEY, BASE_URL } from './config';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
let lastCall = 0;
async function rateLimit() {
  const now = Date.now();
  const diff = now - lastCall;
  if (diff < 220) await delay(220 - diff); // max ~4.5 req/sec
  lastCall = Date.now();
}

async function apiFetch(path: string, params: Record<string, string> = {}, baseOverride?: string): Promise<any> {
  await rateLimit();
  const base = baseOverride || BASE_URL;
  const url = new URL(`${base}${path}`);
  url.searchParams.set('apiKey', API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export interface SnapshotResult {
  ticker: string;
  price: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  prevClose: number | null;
  changePercent: number | null;
}

export async function getSnapshot(ticker: string, market: 'stocks' | 'crypto' | 'index'): Promise<SnapshotResult> {
  try {
    let path: string;
    if (market === 'crypto') {
      path = `/snapshot/locale/global/markets/crypto/tickers/${ticker}`;
    } else if (market === 'index') {
      path = `/snapshot/locale/us/markets/indices/tickers/${ticker}`;
    } else {
      path = `/snapshot/locale/us/markets/stocks/tickers/${ticker}`;
    }
    const data = await apiFetch(path);
    const day = data?.ticker?.day || data?.ticker?.lastTrade || {};
    const prevDay = data?.ticker?.prevDay || {};
    const price = data?.ticker?.lastTrade?.p || data?.ticker?.day?.c || data?.ticker?.lastQuote?.P || null;
    const prevClose = prevDay?.c || null;
    const changePercent = (price && prevClose) ? ((price - prevClose) / prevClose) * 100 : null;
    return {
      ticker,
      price,
      open: day?.o || null,
      high: day?.h || null,
      low: day?.l || null,
      prevClose,
      changePercent,
    };
  } catch (e) {
    return { ticker, price: null, open: null, high: null, low: null, prevClose: null, changePercent: null };
  }
}

export interface IndicatorValue {
  timestamp: number;
  value: number;
}

export interface IndicatorResult {
  ticker: string;
  values: IndicatorValue[];
  error?: string;
}

export async function getRSI(ticker: string, window = 14): Promise<IndicatorResult> {
  try {
    const data = await apiFetch(`/indicators/rsi/${ticker}`, {
      timespan: 'day',
      adjusted: 'true',
      window: String(window),
      series_type: 'close',
      limit: '5',
    }, 'https://api.massive.com/v1');
    return { ticker, values: (data?.results?.values || []).map((v: any) => ({ timestamp: v.timestamp, value: v.value })) };
  } catch (e: any) {
    return { ticker, values: [], error: e.message };
  }
}

export interface MACDValue {
  timestamp: number;
  value: number;
  signal: number;
  histogram: number;
}

export interface MACDResult {
  ticker: string;
  values: MACDValue[];
  error?: string;
}

export async function getMACD(ticker: string): Promise<MACDResult> {
  try {
    const data = await apiFetch(`/indicators/macd/${ticker}`, {
      timespan: 'day',
      adjusted: 'true',
      short_window: '12',
      long_window: '26',
      signal_window: '9',
      series_type: 'close',
      limit: '5',
    }, 'https://api.massive.com/v1');
    return { ticker, values: (data?.results?.values || []).map((v: any) => ({ timestamp: v.timestamp, value: v.value, signal: v.signal, histogram: v.histogram })) };
  } catch (e: any) {
    return { ticker, values: [], error: e.message };
  }
}

export async function getSMA(ticker: string, window: number): Promise<IndicatorResult> {
  try {
    const data = await apiFetch(`/indicators/sma/${ticker}`, {
      timespan: 'day',
      adjusted: 'true',
      window: String(window),
      series_type: 'close',
      limit: '3',
    }, 'https://api.massive.com/v1');
    return { ticker, values: (data?.results?.values || []).map((v: any) => ({ timestamp: v.timestamp, value: v.value })) };
  } catch (e: any) {
    return { ticker, values: [], error: e.message };
  }
}

export async function getEMA(ticker: string, window: number): Promise<IndicatorResult> {
  try {
    const data = await apiFetch(`/indicators/ema/${ticker}`, {
      timespan: 'day',
      adjusted: 'true',
      window: String(window),
      series_type: 'close',
      limit: '3',
    }, 'https://api.massive.com/v1');
    return { ticker, values: (data?.results?.values || []).map((v: any) => ({ timestamp: v.timestamp, value: v.value })) };
  } catch (e: any) {
    return { ticker, values: [], error: e.message };
  }
}
