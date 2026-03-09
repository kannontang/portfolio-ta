import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const assets = await prisma.asset.findMany({
    orderBy: { exchange: 'asc' },
  });

  console.log('\n=== Portfolio Holdings ===\n');

  const byExchange: Record<string, typeof assets> = {};
  for (const asset of assets) {
    if (!byExchange[asset.exchange]) byExchange[asset.exchange] = [];
    byExchange[asset.exchange].push(asset);
  }

  for (const [exchange, holdings] of Object.entries(byExchange)) {
    console.log(`--- ${exchange} ---`);
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

  console.log(`Total assets: ${totalAssets}`);
  console.log(`Total cash: $${totalCash.toFixed(2)}`);
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
