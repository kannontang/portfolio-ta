import { PrismaClient } from '@prisma/client';
import { getCash } from '../cash';

const prisma = new PrismaClient();

async function main() {
  const assets = await prisma.asset.findMany({
    orderBy: { broker: 'asc' },
  });

  console.log('\n=== Portfolio Holdings ===\n');

  const byBroker: Record<string, typeof assets> = {};
  for (const asset of assets) {
    if (!byBroker[asset.broker]) byBroker[asset.broker] = [];
    byBroker[asset.broker].push(asset);
  }

  for (const [broker, holdings] of Object.entries(byBroker)) {
    console.log(`--- ${broker} ---`);
    console.log('Symbol       Quantity      Avg Cost      Type');
    console.log('─'.repeat(60));
    for (const h of holdings) {
      const sym = h.symbol.padEnd(12);
      const qty = h.quantity.toFixed(4).padStart(12);
      const cost = h.avgCost ? `$${h.avgCost.toFixed(2)}`.padStart(12) : 'N/A'.padStart(12);
      const type = h.type;
      console.log(`${sym} ${qty} ${cost}      ${type}`);
    }
    console.log('');
  }

  const totalAssets = assets.length;
  const totalCash = assets
    .filter(a => a.type === 'CASH' || a.type === 'STABLECOIN')
    .reduce((sum, a) => sum + a.quantity * (a.avgCost || 1), 0);

  // Per-broker buying-power summary
  const ibCash = await getCash(prisma, 'IB');
  const futuCash = await getCash(prisma, 'FUTU');
  const binanceCash = await getCash(prisma, 'BINANCE');

  console.log(`Total assets: ${totalAssets}`);
  console.log(`Total cash: $${totalCash.toFixed(2)}`);
  console.log(`  IB:      $${ibCash.toFixed(2)}`);
  console.log(`  Futu:    $${futuCash.toFixed(2)}`);
  console.log(`  Binance: $${binanceCash.toFixed(2)}`);
  console.log('\nRun "pnpm sync" to fetch latest prices and calculate portfolio value.\n');
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
