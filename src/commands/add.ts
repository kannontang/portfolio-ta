import { PrismaClient, AssetType, Exchange } from '@prisma/client';

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

  if (!args.symbol || !args.quantity || !args.exchange) {
    console.error('Usage: pnpm add -- --symbol AAPL --quantity 10 --cost 150 --exchange FUTU --type STOCK --name "Apple Inc"');
    console.error('\nRequired: --symbol, --quantity, --exchange');
    console.error('Optional: --cost, --type (default: STOCK), --name (default: symbol)');
    process.exit(1);
  }

  const symbol = args.symbol.toUpperCase();
  const quantity = parseFloat(args.quantity);
  const avgCost = args.cost ? parseFloat(args.cost) : null;
  const exchange = args.exchange.toUpperCase() as Exchange;
  const type = (args.type?.toUpperCase() || 'STOCK') as AssetType;
  const name = args.name || symbol;

  // Check if asset exists (by symbol + exchange)
  const existing = await prisma.asset.findUnique({ 
    where: { symbol_exchange: { symbol, exchange } } 
  });

  if (existing) {
    // Update existing
    const updated = await prisma.asset.update({
      where: { symbol_exchange: { symbol, exchange } },
      data: {
        quantity,
        avgCost: avgCost ?? existing.avgCost,
        type,
        name,
      },
    });
    console.log(`\n✅ Updated ${symbol}:`);
    console.log(`   Quantity: ${updated.quantity}`);
    console.log(`   Avg Cost: ${updated.avgCost ? `$${updated.avgCost.toFixed(2)}` : 'N/A'}`);
    console.log(`   Exchange: ${updated.exchange}`);
    console.log(`   Type: ${updated.type}\n`);
  } else {
    // Create new
    const created = await prisma.asset.create({
      data: {
        symbol,
        name,
        type,
        exchange,
        quantity,
        avgCost,
      },
    });
    console.log(`\n✅ Added ${symbol}:`);
    console.log(`   Name: ${created.name}`);
    console.log(`   Quantity: ${created.quantity}`);
    console.log(`   Avg Cost: ${created.avgCost ? `$${created.avgCost.toFixed(2)}` : 'N/A'}`);
    console.log(`   Exchange: ${created.exchange}`);
    console.log(`   Type: ${created.type}\n`);
  }
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
