import { PORTFOLIO, API_KEY } from './config';
import { analyzeAsset } from './analysis';
import { formatReport, saveOutput } from './output';

if (!API_KEY) {
  console.error('Error: MASSIVE_API_KEY not set in .env');
  process.exit(1);
}

const args = process.argv.slice(2);
const allFlag = args.includes('--all');
const jsonFlag = args.includes('--json');
const tickerArg = args.find(a => a.startsWith('--ticker='))?.split('=')[1]
  || (args.includes('--ticker') ? args[args.indexOf('--ticker') + 1] : null);

async function main() {
  let assets = PORTFOLIO;

  if (tickerArg) {
    const match = PORTFOLIO.find(a => a.ticker.toUpperCase() === tickerArg.toUpperCase());
    if (!match) {
      console.error(`Ticker ${tickerArg} not found in portfolio. Available: ${PORTFOLIO.map(a => a.ticker).join(', ')}`);
      process.exit(1);
    }
    assets = [match];
  } else if (!allFlag) {
    console.log('Usage:');
    console.log('  npx ts-node src/index.ts --all              # analyse all portfolio assets');
    console.log('  npx ts-node src/index.ts --ticker RSP       # analyse single ticker');
    console.log('  npx ts-node src/index.ts --all --json       # output JSON only');
    process.exit(0);
  }

  console.log(`\nFetching TA data for ${assets.length} asset(s)...\n`);

  const results = [];
  for (const asset of assets) {
    process.stdout.write(`  ${asset.ticker.padEnd(12)}`);
    try {
      const r = await analyzeAsset(asset);
      results.push(r);
      process.stdout.write(`$${r.price?.toFixed(2) ?? 'N/A'} — ${r.signal}\n`);
    } catch (e: any) {
      process.stdout.write(`ERROR: ${e.message}\n`);
    }
  }

  if (jsonFlag) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log('\n' + formatReport(results));
  }

  saveOutput(results);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
