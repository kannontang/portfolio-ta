import * as dotenv from 'dotenv';
dotenv.config();

export const API_KEY = process.env.MASSIVE_API_KEY || '';
export const BASE_URL = 'https://api.massive.com/v2';

export interface Asset {
  ticker: string;
  name: string;
  category: string;
  market: 'stocks' | 'crypto' | 'index';
  shares?: number;
  avgCost?: number;
}

export const PORTFOLIO: Asset[] = [
  // Core Index
  { ticker: 'RSP', name: 'Invesco S&P 500 Equal Weight', category: 'Core Index', market: 'stocks', shares: 14, avgCost: 195.75 },
  // Precious Metals
  { ticker: 'GLDM', name: 'SPDR Gold MiniShares', category: 'Precious Metals', market: 'stocks', shares: 50, avgCost: 60.45 },
  { ticker: 'SLV', name: 'iShares Silver Trust', category: 'Precious Metals', market: 'stocks', shares: 16, avgCost: 77.48 },
  // Income
  { ticker: 'JEPI', name: 'JPMorgan Equity Premium Income', category: 'Income', market: 'stocks', shares: 100, avgCost: 58.64 },
  // Tech / Growth
  { ticker: 'TSLA', name: 'Tesla', category: 'Tech', market: 'stocks', shares: 10, avgCost: 248.81 },  // IB 5@309.9 + Futu 5@187.724
  { ticker: 'NVDA', name: 'Nvidia', category: 'Tech', market: 'stocks', shares: 15, avgCost: 184.56 },
  { ticker: 'MSFT', name: 'Microsoft', category: 'Tech', market: 'stocks', shares: 6, avgCost: 397.34 },
  { ticker: 'GOOG', name: 'Alphabet', category: 'Tech', market: 'stocks', shares: 2, avgCost: 307.125 },  // 2@30.125 each
  { ticker: 'AMZN', name: 'Amazon', category: 'Tech', market: 'stocks', shares: 3, avgCost: 209.94 },
  { ticker: 'PLTR', name: 'Palantir', category: 'Tech', market: 'stocks', shares: 18, avgCost: 163.18 },
  { ticker: 'RKLB', name: 'Rocket Lab', category: 'Tech', market: 'stocks', shares: 10, avgCost: 72.23 },
  // Chip Bottom-fishing
  { ticker: 'SMH', name: 'VanEck Semiconductor ETF', category: 'Chips', market: 'stocks', shares: 6, avgCost: 417.182 },
  { ticker: 'MU', name: 'Micron Technology', category: 'Chips', market: 'stocks', shares: 3, avgCost: 379.12 },
  { ticker: 'TSM', name: 'Taiwan Semiconductor', category: 'Chips', market: 'stocks', shares: 4, avgCost: 329.14 }, // +2@322.68 on 2026-03-25
  { ticker: 'EWY', name: 'iShares MSCI South Korea', category: 'Chips', market: 'stocks', shares: 2, avgCost: 122.15 },
  // Financials
  { ticker: 'V', name: 'Visa', category: 'Financials', market: 'stocks', shares: 3, avgCost: 337.91 },
  // Sectors / Infra
  { ticker: 'PAVE', name: 'Global X US Infrastructure Dev', category: 'Infrastructure', market: 'stocks', shares: 11, avgCost: 52.44 },
  { ticker: 'XLU', name: 'Utilities Select Sector SPDR', category: 'Utilities', market: 'stocks', shares: 11, avgCost: 46.48 },
  { ticker: 'COPX', name: 'Global X Copper Miners', category: 'Copper', market: 'stocks', shares: 20, avgCost: 77.48 },
  // Defence / Space
  { ticker: 'XAR', name: 'SPDR S&P Aerospace & Defense', category: 'Defence', market: 'stocks', shares: 2, avgCost: 280.00 },
  { ticker: 'UFO', name: 'Procure Space ETF', category: 'Space', market: 'stocks', shares: 10, avgCost: 43.16 },
  // Nuclear
  { ticker: 'URA', name: 'Global X Uranium ETF', category: 'Nuclear', market: 'stocks', shares: 32, avgCost: 52.79 },
  // Misc
  { ticker: 'SHLD', name: 'Global X Defense Tech', category: 'Defence', market: 'stocks', shares: 3, avgCost: 77.05 },
  // v6.1 Framework - Not owned
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', category: 'Core Index', market: 'stocks', shares: 0 },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'Core Index', market: 'stocks', shares: 0 },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', category: 'AI/Quantum', market: 'stocks', shares: 0 },
  { ticker: 'GLD', name: 'SPDR Gold Shares', category: 'Precious Metals', market: 'stocks', shares: 0 },
  { ticker: 'GDX', name: 'VanEck Gold Miners ETF', category: 'Precious Metals', market: 'stocks', shares: 0 },
  { ticker: 'DXJ', name: 'WisdomTree Japan', category: 'Japan', market: 'stocks', shares: 0 },
  { ticker: 'EWJ', name: 'iShares MSCI Japan', category: 'Japan', market: 'stocks', shares: 0 },
  { ticker: 'PWR', name: 'Quanta Services', category: 'Utilities/Infra', market: 'stocks', shares: 0 },
  { ticker: 'GEV', name: 'GE Vernova', category: 'Utilities/Infra', market: 'stocks', shares: 0 },
  { ticker: 'USO', name: 'United States Oil Fund', category: 'Energy Short', market: 'stocks', shares: 0 },
  { ticker: 'XOM', name: 'Exxon Mobil', category: 'Energy Short', market: 'stocks', shares: 0 },
  { ticker: 'CVX', name: 'Chevron', category: 'Energy Short', market: 'stocks', shares: 0 },
  { ticker: 'RTX', name: 'RTX Corp', category: 'Defence', market: 'stocks', shares: 0 },
  { ticker: 'LMT', name: 'Lockheed Martin', category: 'Defence', market: 'stocks', shares: 0 },
  { ticker: 'NLR', name: 'VanEck Uranium ETF', category: 'Nuclear', market: 'stocks', shares: 0 },
  { ticker: 'CCJ', name: 'Cameco Corp', category: 'Nuclear', market: 'stocks', shares: 0 },
  { ticker: 'BE', name: 'Bloom Energy', category: 'Nuclear/Clean', market: 'stocks', shares: 0 },
  { ticker: 'SCCO', name: 'Freeport-McMoRan', category: 'Copper', market: 'stocks', shares: 0 },
  { ticker: 'QQQI', name: 'ProShares Nasdaq QQQI', category: 'Dividend', market: 'stocks', shares: 0 },
  // Crypto
  { ticker: 'X:BTCUSD', name: 'Bitcoin', category: 'Crypto', market: 'crypto', shares: 0, avgCost: 0 },
  { ticker: 'X:BNBUSD', name: 'BNB', category: 'Crypto', market: 'crypto', shares: 0, avgCost: 0 },
  // Indices
  { ticker: 'I:SPX', name: 'S&P 500', category: 'Index', market: 'index', shares: 0, avgCost: 0 },
  { ticker: 'I:VIX', name: 'VIX', category: 'Index', market: 'index', shares: 0, avgCost: 0 },
  // New Positions
  { ticker: 'OKLO', name: 'Oklo Inc', category: 'Nuclear', market: 'stocks', shares: 30, avgCost: 56.63 },
];

export const CASH = {
  futu: 12992.45,
  ib: 20495.50,
  usdt: 0
};
