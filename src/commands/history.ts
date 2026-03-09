import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        parsed[key] = value;
        i++;
      }
    }
  }

  return parsed;
}

async function main() {
  const args = parseArgs();
  const days = parseInt(args.days || '30');

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const snapshots = await prisma.portfolioSnapshot.findMany({
    where: {
      timestamp: { gte: cutoff },
    },
    orderBy: { timestamp: 'asc' },
  });

  if (snapshots.length === 0) {
    console.log(`\n⚠️  No portfolio snapshots found in the last ${days} days.`);
    console.log('Run "pnpm sync" to create your first snapshot.\n');
    return;
  }

  console.log(`\n=== Portfolio Value History (Last ${days} Days) ===\n`);
  console.log('Date                 Total Value    Cash       Crypto     Stocks/ETF');
  console.log('─'.repeat(80));

  for (const snap of snapshots) {
    const date = snap.timestamp.toISOString().split('T')[0];
    const time = snap.timestamp.toTimeString().split(' ')[0];
    const total = `$${snap.totalValue.toFixed(2)}`.padStart(14);
    const cash = `$${snap.cashValue.toFixed(2)}`.padStart(10);
    const crypto = `$${snap.cryptoValue.toFixed(2)}`.padStart(10);
    const stock = `$${snap.stockValue.toFixed(2)}`.padStart(10);
    console.log(`${date} ${time}  ${total}  ${cash}  ${crypto}  ${stock}`);
  }

  // Calculate P&L
  if (snapshots.length >= 2) {
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const change = last.totalValue - first.totalValue;
    const changePct = (change / first.totalValue) * 100;
    const sign = change >= 0 ? '+' : '';

    console.log('\n=== Summary ===');
    console.log(`First snapshot: $${first.totalValue.toFixed(2)} (${first.timestamp.toISOString().split('T')[0]})`);
    console.log(`Last snapshot:  $${last.totalValue.toFixed(2)} (${last.timestamp.toISOString().split('T')[0]})`);
    console.log(`Change:         ${sign}$${change.toFixed(2)} (${sign}${changePct.toFixed(2)}%)`);
  }

  console.log('');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
