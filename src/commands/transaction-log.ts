import { PrismaClient, Broker, TransactionAction } from '@prisma/client';
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
  const brokerArg = parsed.broker || parsed.exchange; // accept --exchange for back-compat

  if (flags.has('add')) {
    if (
      !parsed.date ||
      !parsed.ticker ||
      !parsed.action ||
      !parsed.quantity ||
      !parsed.price ||
      !brokerArg
    ) {
      console.error(
        'Usage: pnpm transaction:log -- --add --date YYYY-MM-DD --ticker NVDA --action buy --quantity 10 --price 175.5 --broker IB [--total 1755] [--fee 1.50] [--notes "optional"]'
      );
      process.exit(1);
    }

    const quantity = parseFloat(parsed.quantity);
    const price = parseFloat(parsed.price);
    const totalValue = parsed.total
      ? parseFloat(parsed.total)
      : Math.round(quantity * price * 1e6) / 1e6;
    const fee = parsed.fee ? parseFloat(parsed.fee) : 0;

    const created = await logTransaction(prisma, {
      date: parseDateOnly(parsed.date),
      ticker: parsed.ticker,
      action: parseAction(parsed.action),
      quantity,
      price,
      totalValue,
      fee,
      feeCcy: parsed['fee-ccy'] ?? 'USD',
      broker: brokerArg.toUpperCase() as Broker,
      notes: parsed.notes ?? null,
    });

    console.log('\n✅ Logged transaction:');
    console.log(`   ID: ${created.id}`);
    console.log(`   ${created.date.toISOString().split('T')[0]} ${created.action} ${created.quantity} ${created.ticker} @ $${created.price.toFixed(4)}`);
    console.log(`   Total: $${created.totalValue.toFixed(2)} | Fee: $${created.fee.toFixed(2)} | ${created.broker}`);
    if (created.action === 'SELL') {
      console.log(
        `   Realized P/L: ${
          created.realizedPnL == null ? 'N/A' : `$${created.realizedPnL.toFixed(2)}`
        }`
      );
    }
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
    broker: brokerArg ? (brokerArg.toUpperCase() as Broker) : undefined,
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

  const showRealizedPnL = rows.some(r => r.action === 'SELL' && r.realizedPnL != null);

  console.log('\n=== Transaction log ===\n');
  const header = showRealizedPnL
    ? 'Date       Ticker  Action  Qty        Price      Total        Fee       Broker    Realized P/L  Notes'
    : 'Date       Ticker  Action  Qty        Price      Total        Fee       Broker    Notes';
  console.log(header);
  console.log('─'.repeat(header.length));

  for (const t of rows) {
    const date = t.date.toISOString().split('T')[0];
    const qty = t.quantity.toString();
    const price = `$${t.price.toFixed(4)}`.padStart(10);
    const total = `$${t.totalValue.toFixed(2)}`.padStart(14);
    const fee = `$${t.fee.toFixed(2)}`.padStart(8);
    const realized = showRealizedPnL
      ? (t.realizedPnL == null ? ''.padStart(12) : `$${t.realizedPnL.toFixed(2)}`.padStart(12))
      : '';
    const notes = t.notes ? (t.notes.length > 40 ? t.notes.slice(0, 37) + '...' : t.notes) : '';
    console.log(
      showRealizedPnL
        ? `${date}  ${t.ticker.padEnd(6)}  ${t.action.padEnd(6)}  ${qty.padStart(10)}  ${price}  ${total}  ${fee}  ${t.broker.padEnd(8)}  ${realized}  ${notes}`
        : `${date}  ${t.ticker.padEnd(6)}  ${t.action.padEnd(6)}  ${qty.padStart(10)}  ${price}  ${total}  ${fee}  ${t.broker.padEnd(8)}  ${notes}`
    );
  }
  console.log('');
}

main()
  .catch(e => {
    // Surface errors from logTransaction (insufficient cash, insufficient shares, etc.)
    // loudly so the Discord/OpenClaw bot can relay them instead of silently dropping.
    console.error('❌', e?.message ?? e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
