import { getHistoricalPrice } from '../api';

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
  const ticker = args.ticker;
  const date = args.date;

  if (!ticker || !date) {
    console.log('\nUsage: npm run historical -- --ticker GLDM --date 2026-03-11\n');
    console.log('Arguments:');
    console.log('  --ticker   Stock ticker symbol (e.g., GLDM, AAPL)');
    console.log('  --date     Date in YYYY-MM-DD format (e.g., 2026-03-11)\n');
    process.exit(1);
  }

  console.log(`\nFetching historical data for ${ticker} on ${date}...\n`);

  const result = await getHistoricalPrice(ticker, date);

  if (result.error) {
    console.error(`❌ Error: ${result.error}`);
    process.exit(1);
  }

  console.log(`=== ${ticker} - ${result.date} ===\n`);
  console.log(`Open:      ${result.open !== null ? `$${result.open.toFixed(2)}` : 'N/A'}`);
  console.log(`High:      ${result.high !== null ? `$${result.high.toFixed(2)}` : 'N/A'}`);
  console.log(`Low:       ${result.low !== null ? `$${result.low.toFixed(2)}` : 'N/A'}`);
  console.log(`Close:     ${result.close !== null ? `$${result.close.toFixed(2)}` : 'N/A'}`);
  console.log(`Volume:    ${result.volume !== null ? result.volume.toLocaleString() : 'N/A'}`);
  console.log('');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
