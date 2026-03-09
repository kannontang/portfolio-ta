import * as fs from 'fs';
import * as path from 'path';
import { TAResult } from './analysis';

const SIGNAL_EMOJI: Record<string, string> = {
  'STRONG BUY': '🟢🟢',
  'BUY': '🟢',
  'HOLD': '🟡',
  'SELL': '🔴',
  'STRONG SELL': '🔴🔴',
  'N/A': '⚪',
};

function fmt(n: number | null, decimals = 2, prefix = ''): string {
  if (n === null) return 'N/A';
  return `${prefix}${n.toFixed(decimals)}`;
}

function fmtPct(n: number | null): string {
  if (n === null) return 'N/A';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export function formatReport(results: TAResult[]): string {
  const date = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  lines.push(`=== Portfolio TA Report (${date}) ===`);
  lines.push('');

  // Group by category
  const categories = [...new Set(results.map(r => r.category))];

  for (const cat of categories) {
    const group = results.filter(r => r.category === cat);
    lines.push(`--- ${cat} ---`);
    lines.push('Ticker   Price        Chg%      RSI    MACD      SMA20     SMA50     Signal');
    lines.push('─'.repeat(95));
    for (const r of group) {
      const ticker = r.ticker.replace('X:', '').replace('I:', '').padEnd(8);
      const price = fmt(r.price, 2, '$').padEnd(12);
      const chg = fmtPct(r.changePercent).padEnd(9);
      const rsi = fmt(r.rsi, 1).padEnd(6);
      const macd = (r.macdSignal || 'N/A').padEnd(9);
      const sma20 = fmt(r.sma20, 2, '$').padEnd(9);
      const sma50 = fmt(r.sma50, 2, '$').padEnd(9);
      const sig = `${SIGNAL_EMOJI[r.signal] || ''} ${r.signal}`;
      lines.push(`${ticker} ${price} ${chg} ${rsi} ${macd} ${sma20} ${sma50} ${sig}`);
      if (r.notes.length > 0) lines.push(`         Notes: ${r.notes.join(' | ')}`);
    }
    lines.push('');
  }

  // Summary
  lines.push('=== Summary ===');
  const bySignal: Record<string, string[]> = {};
  for (const r of results) {
    if (!bySignal[r.signal]) bySignal[r.signal] = [];
    bySignal[r.signal].push(r.ticker.replace('X:', '').replace('I:', ''));
  }
  for (const [sig, tickers] of Object.entries(bySignal)) {
    lines.push(`${SIGNAL_EMOJI[sig] || ''} ${sig}: ${tickers.join(', ')}`);
  }

  return lines.join('\n');
}

export function saveOutput(results: TAResult[]): void {
  const outDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // JSON
  const jsonPath = path.join(outDir, 'ta-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`JSON saved: ${jsonPath}`);

  // Text
  const txtPath = path.join(outDir, 'ta-report.txt');
  fs.writeFileSync(txtPath, formatReport(results));
  console.log(`Text saved: ${txtPath}`);
}
