import { PrismaClient } from '@prisma/client';
import { getSnapshot } from '../api';
import { PORTFOLIO } from '../config';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔄 Syncing portfolio prices...\n');

  const assets = await prisma.asset.findMany();
  let successCount = 0;
  let errorCount = 0;

  for (const asset of assets) {
    // Skip cash/stablecoins (price = 1 or fixed rate)
    if (asset.type === 'CASH' || asset.type === 'STABLECOIN') {
      const price = asset.type === 'STABLECOIN' ? 1 : (asset.avgCost || 1);
      await prisma.priceHistory.create({
        data: {
          assetId: asset.id,
          price,
          currency: 'USD',
          source: 'fixed',
        },
      });
      process.stdout.write(`  ${asset.symbol.padEnd(12)} $${price.toFixed(2)} (fixed)\n`);
      successCount++;
      continue;
    }

    // Map asset symbol to Massive.com ticker format
    let ticker = asset.symbol;
    let market: 'stocks' | 'crypto' | 'index' = 'stocks';

    if (asset.type === 'CRYPTO') {
      market = 'crypto';
      // Massive.com crypto format: X:BTCUSD, X:BNBUSD
      if (ticker === 'BTC') ticker = 'X:BTCUSD';
      else if (ticker === 'BNB') ticker = 'X:BNBUSD';
      else if (ticker === 'ETH') ticker = 'X:ETHUSD';
      else ticker = `X:${ticker}USD`;
    } else if (ticker === 'TSLA_IB') {
      ticker = 'TSLA'; // IB TSLA uses same ticker
    }

    // Find matching config for market type
    const configAsset = PORTFOLIO.find(p => p.ticker === ticker || p.ticker === asset.symbol);
    if (configAsset) market = configAsset.market;

    try {
      const snap = await getSnapshot(ticker, market);
      const price = snap.price || snap.prevClose || (asset.type === 'CRYPTO' ? asset.avgCost : null); // Fallback to avgCost for crypto
      if (price) {
        await prisma.priceHistory.create({
          data: {
            assetId: asset.id,
            price,
            currency: 'USD',
            source: snap.price || snap.prevClose ? 'massive' : 'fallback',
          },
        });
        const label = snap.price ? '' : snap.prevClose ? '(prev close)' : '(cost basis)';
        process.stdout.write(`  ${asset.symbol.padEnd(12)} $${price.toFixed(2)} ${label}\n`);
        successCount++;
      } else {
        process.stdout.write(`  ${asset.symbol.padEnd(12)} ❌ No price data\n`);
        errorCount++;
      }
    } catch (e: any) {
      process.stdout.write(`  ${asset.symbol.padEnd(12)} ❌ ${e.message}\n`);
      errorCount++;
    }
  }

  console.log(`\n✅ Synced ${successCount} assets, ${errorCount} errors\n`);

  // Calculate portfolio value
  console.log('📊 Calculating portfolio value...\n');

  const latestPrices = await prisma.priceHistory.groupBy({
    by: ['assetId'],
    _max: { timestamp: true },
  });

  let totalValue = 0;
  let cashValue = 0;
  let cryptoValue = 0;
  let stockValue = 0;

  for (const asset of assets) {
    const latestPriceRecord = latestPrices.find(p => p.assetId === asset.id);
    if (!latestPriceRecord) continue;

    const priceHistory = await prisma.priceHistory.findFirst({
      where: {
        assetId: asset.id,
        timestamp: latestPriceRecord._max.timestamp!,
      },
    });

    if (!priceHistory) continue;

    const value = asset.quantity * priceHistory.price;
    totalValue += value;

    if (asset.type === 'CASH' || asset.type === 'STABLECOIN') {
      cashValue += value;
    } else if (asset.type === 'CRYPTO') {
      cryptoValue += value;
    } else {
      stockValue += value;
    }
  }

  // Save snapshot
  await prisma.portfolioSnapshot.create({
    data: {
      totalValue,
      cashValue,
      cryptoValue,
      stockValue,
    },
  });

  console.log(`Total Value:  $${totalValue.toFixed(2)}`);
  console.log(`  Cash:       $${cashValue.toFixed(2)} (${((cashValue / totalValue) * 100).toFixed(1)}%)`);
  console.log(`  Crypto:     $${cryptoValue.toFixed(2)} (${((cryptoValue / totalValue) * 100).toFixed(1)}%)`);
  console.log(`  Stocks/ETF: $${stockValue.toFixed(2)} (${((stockValue / totalValue) * 100).toFixed(1)}%)`);
  console.log('\n✅ Portfolio snapshot saved!\n');
}

main()
  .catch(e => {
    console.error('❌ Sync failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
