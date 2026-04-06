import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding portfolio data...');

  // Cash & Stablecoins
  await prisma.asset.create({
    data: {
      symbol: 'USD_FUTU',
      name: 'Futu USD Cash',
      type: 'CASH',
      broker: 'FUTU',
      quantity: 17438.16,
      avgCost: 1,
    },
  });

  await prisma.asset.create({
    data: {
      symbol: 'USD_IB',
      name: 'IB USD Cash',
      type: 'CASH',
      broker: 'IB',
      quantity: 13135.00, // primary USD buying power at IB
      avgCost: 1,
    },
  });

  await prisma.asset.create({
    data: {
      symbol: 'HKD_IB',
      name: 'IB HKD Cash',
      type: 'CASH',
      broker: 'IB',
      quantity: 8860,
      avgCost: 0.128, // 1/7.8 — archival HKD bucket, not used for trade math
    },
  });

  await prisma.asset.create({
    data: {
      symbol: 'USDT',
      name: 'Binance USDT',
      type: 'STABLECOIN',
      broker: 'BINANCE',
      quantity: 5412,
      avgCost: 1,
    },
  });

  // Crypto
  await prisma.asset.create({
    data: {
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'CRYPTO',
      broker: 'BINANCE',
      quantity: 0.15,
      avgCost: 68290.06,
    },
  });

  await prisma.asset.create({
    data: {
      symbol: 'BNB',
      name: 'Binance Coin',
      type: 'CRYPTO',
      broker: 'BINANCE',
      quantity: 0.925,
      avgCost: 628.15,
    },
  });

  // Interactive Brokers
  await prisma.asset.create({
    data: {
      symbol: 'GLDM',
      name: 'SPDR Gold MiniShares',
      type: 'ETF',
      broker: 'IB',
      quantity: 300,
      avgCost: 101.96,
    },
  });

  await prisma.asset.create({
    data: {
      symbol: 'TSLA_IB',
      name: 'Tesla (IB)',
      type: 'STOCK',
      broker: 'IB',
      quantity: 5,
      avgCost: 417.33,
    },
  });

  await prisma.asset.create({
    data: {
      symbol: 'V',
      name: 'Visa',
      type: 'STOCK',
      broker: 'IB',
      quantity: 3,
      avgCost: 312.99,
    },
  });

  // Futu
  const futuHoldings = [
    { symbol: 'AMZN', name: 'Amazon', quantity: 3, avgCost: 210.64 },
    { symbol: 'ASAN', name: 'Asana', quantity: 500, avgCost: null }, // negative value, skip cost
    { symbol: 'GOOG', name: 'Alphabet', quantity: 1, avgCost: 313.03 },
    { symbol: 'IONQ', name: 'IonQ', quantity: 30, avgCost: 33.59 },
    { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income', quantity: 85, avgCost: 59.51 },
    { symbol: 'MSFT', name: 'Microsoft', quantity: 3, avgCost: 400.64 },
    { symbol: 'MU', name: 'Micron Technology', quantity: 1, avgCost: 429.00 },
    { symbol: 'NVDA', name: 'Nvidia', quantity: 10, avgCost: 195.63 },
    { symbol: 'PLTR', name: 'Palantir', quantity: 18, avgCost: 134.19 },
    { symbol: 'RKLB', name: 'Rocket Lab', quantity: 10, avgCost: 70.20 },
    { symbol: 'SHLD', name: 'Global X Defense Tech', quantity: 3, avgCost: 73.92 },
    { symbol: 'TSLA', name: 'Tesla', quantity: 5, avgCost: 417.33 },
    { symbol: 'TXG', name: 'TXG', quantity: 50, avgCost: 19.66 },
    { symbol: 'UFO', name: 'Procure Space ETF', quantity: 10, avgCost: 44.39 },
    { symbol: 'URA', name: 'Global X Uranium ETF', quantity: 10, avgCost: 55.19 },
    { symbol: 'XAR', name: 'SPDR S&P Aerospace & Defense', quantity: 2, avgCost: 280.54 },
  ];

  for (const holding of futuHoldings) {
    await prisma.asset.create({
      data: {
        symbol: holding.symbol,
        name: holding.name,
        type: holding.symbol === 'JEPI' ? 'ETF' : 'STOCK',
        broker: 'FUTU',
        quantity: holding.quantity,
        avgCost: holding.avgCost,
      },
    });
  }

  console.log('✅ Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
