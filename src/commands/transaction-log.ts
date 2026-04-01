import { PrismaClient, Exchange, TransactionAction } from '@prisma/client';
import { getTransactionHistory, logTransaction } from '../transactions';

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};
  const flags = new Set<string>();

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      if (key === 'add' || key === 'json') {
        flags.add(key);
        continue;
      }
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        parsed[key] = value;
        i++;
      } else {
        flags.add(key);
      }
    }
  }

  return { parsed, flags };
}

function parseDateOnly(s: string): Date {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${s}`);
  }
  return d;
}

function parseAction(s: string): TransactionAction {
  const u = s.toUpperCase();
  if (u === 'BUY' || u === 'SELL') {
    return u as TransactionAction;
  }
  throw new Error(`Invalid action: ${s} (use buy or sell)`);
}

async function main() {
  const { parsed, flags } = parseArgs();

  if (flags.has('add')) {
    if (
      !parsed.date ||
      !parsed.ticker ||
      !parsed.action ||
      !parsed.quantity ||
      !parsed.price ||
      !parsed.exchange
    ) {
      console.error(
        'Usage: pnpm transaction:log -- --add --date YYYY-MM-DD --ticker NVDA --action buy --quantity 10 --price 175.5 --exchange IB [--total 1755] [--notes "optional"]'
      );
      process.exit(1);
    }

    const quantity = parseFloat(parsed.quantity);
    const price = parseFloat(parsed.price);
    const totalValue = parsed.total
      ? parseFloat(parsed.total)
      : Math.round(quantity * price * 1e6) / 1e6;

    const created = await logTransaction(prisma, {
      date: parseDateOnly(parsed.date),
      ticker: parsed.ticker,
      action: parseAction(parsed.action),
      quantity,
      price,
      totalValue,
      exchange: parsed.exchange.toUpperCase() as Exchange,
      notes: parsed.notes ?? null,
    });

    console.log('\n✅ Logged transaction:');
    console.log(`   ID: ${created.id}`);
    console.log(`   ${created.date.toISOString().split('T')[0]} ${created.action} ${created.quantity} ${created.ticker} @ $${created.price.toFixed(4)}`);
    console.log(`   Total: $${created.totalValue.toFixed(2)} | ${created.exchange}`);
    if (created.notes) console.log(`   Notes: ${created.notes}`);
    console.log('');
    return;
  }

  const days = parsed.days ? parseInt(parsed.days, 10) : undefined;
  let from: Date | undefined;
  let to: Date | undefined;
  if (days !== undefined && !Number.isNaN(days)) {
    to = new Date();
    from = new Date();
    from.setDate(from.getDate() - days);
  }
  if (parsed.from) {
    from = parseDateOnly(parsed.from);
  }
  if (parsed.to) {
    to = parseDateOnly(parsed.to);
  }

  const rows = await getTransactionHistory(prisma, {
    ticker: parsed.ticker,
    exchange: parsed.exchange ? (parsed.exchange.toUpperCase() as Exchange) : undefined,
    action: parsed.action ? parseAction(parsed.action) : undefined,
    from,
    to,
    limit: parsed.limit ? parseInt(parsed.limit, 10) : undefined,
  });

  if (flags.has('json')) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (rows.length === 0) {
    console.log('\nNo transactions found. Use --add to log one, or widen filters.\n');
    return;
  }

  console.log('\n=== Transaction log ===\n');
  console.log(
    'Date       Ticker  Action  Qty        Price      Total        Exchange  Notes'
  );
  console.log('─'.repeat(100));

  for (const t of rows) {
    const date = t.date.toISOString().split('T')[0];
    const qty = t.quantity.toString();
    const price = `$${t.price.toFixed(4)}`.padStart(10);
    const total = `$${t.totalValue.toFixed(2)}`.padStart(14);
    const notes = t.notes ? (t.notes.length > 40 ? t.notes.slice(0, 37) + '...' : t.notes) : '');
    console.log(
      `${date}  ${t.ticker.padEnd(6)}  ${t.action.padEnd(6)}  ${qty.padStart(10)}  ${price}  ${total}  ${t.exchange.padEnd(8)}  ${notes}`
    );
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
