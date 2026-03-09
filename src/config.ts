import * as dotenv from 'dotenv';
dotenv.config();

export const API_KEY = process.env.MASSIVE_API_KEY || '';
export const BASE_URL = 'https://api.massive.com/v3';

export interface Asset {
  ticker: string;
  name: string;
  category: string;
  market: 'stocks' | 'crypto' | 'index';
}

export const PORTFOLIO: Asset[] = [
  // Core Index
  { ticker: 'RSP', name: 'Invesco S&P 500 Equal Weight', category: 'Core Index', market: 'stocks' },
  // Precious Metals
  { ticker: 'GLDM', name: 'SPDR Gold MiniShares', category: 'Precious Metals', market: 'stocks' },
  { ticker: 'SLV', name: 'iShares Silver Trust', category: 'Precious Metals', market: 'stocks' },
  // Income
  { ticker: 'JEPI', name: 'JPMorgan Equity Premium Income', category: 'Income', market: 'stocks' },
  // Tech / Growth
  { ticker: 'TSLA', name: 'Tesla', category: 'Tech', market: 'stocks' },
  { ticker: 'NVDA', name: 'Nvidia', category: 'Tech', market: 'stocks' },
  { ticker: 'MSFT', name: 'Microsoft', category: 'Tech', market: 'stocks' },
  { ticker: 'GOOG', name: 'Alphabet', category: 'Tech', market: 'stocks' },
  { ticker: 'AMZN', name: 'Amazon', category: 'Tech', market: 'stocks' },
  { ticker: 'PLTR', name: 'Palantir', category: 'Tech', market: 'stocks' },
  { ticker: 'RKLB', name: 'Rocket Lab', category: 'Tech', market: 'stocks' },
  // Chip Bottom-fishing
  { ticker: 'SMH', name: 'VanEck Semiconductor ETF', category: 'Chips', market: 'stocks' },
  { ticker: 'MU', name: 'Micron Technology', category: 'Chips', market: 'stocks' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor', category: 'Chips', market: 'stocks' },
  { ticker: 'EWY', name: 'iShares MSCI South Korea', category: 'Chips', market: 'stocks' },
  // Financials
  { ticker: 'V', name: 'Visa', category: 'Financials', market: 'stocks' },
  // Sectors / Infra
  { ticker: 'PAVE', name: 'Global X US Infrastructure Dev', category: 'Infrastructure', market: 'stocks' },
  { ticker: 'XLU', name: 'Utilities Select Sector SPDR', category: 'Utilities', market: 'stocks' },
  { ticker: 'COPX', name: 'Global X Copper Miners', category: 'Copper', market: 'stocks' },
  // Defence / Space
  { ticker: 'XAR', name: 'SPDR S&P Aerospace & Defense', category: 'Defence', market: 'stocks' },
  { ticker: 'UFO', name: 'Procure Space ETF', category: 'Space', market: 'stocks' },
  // Nuclear
  { ticker: 'URA', name: 'Global X Uranium ETF', category: 'Nuclear', market: 'stocks' },
  // Misc
  { ticker: 'SHLD', name: 'Global X Defense Tech', category: 'Defence', market: 'stocks' },
  // Crypto
  { ticker: 'X:BTCUSD', name: 'Bitcoin', category: 'Crypto', market: 'crypto' },
  { ticker: 'X:BNBUSD', name: 'BNB', category: 'Crypto', market: 'crypto' },
  // Indices
  { ticker: 'I:SPX', name: 'S&P 500', category: 'Index', market: 'index' },
  { ticker: 'I:VIX', name: 'VIX', category: 'Index', market: 'index' },
];
