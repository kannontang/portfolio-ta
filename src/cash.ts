import type { Broker, PrismaClient } from '@prisma/client';

/**
 * Each broker (IB, Futu, Binance) holds its own cash pool. When a trade is
 * recorded for a broker, the corresponding cash row is debited (buy) or
 * credited (sell). These symbols map a broker to its primary cash asset.
 *
 * All cash is tracked in USD to keep trade math simple. If a broker also
 * holds HKD or other currencies, use a separate asset row (e.g. HKD_IB)
 * that is NOT the primary cash pool.
 */
export const CASH_SYMBOL_BY_BROKER: Record<Broker, string | null> = {
  IB: 'USD_IB',
  FUTU: 'USD_FUTU',
  BINANCE: 'USDT',
  CASH: null, // manual / non-broker bucket — no auto cash side effects
};

/** Return the USD cash balance available on a given broker. */
export async function getCash(
  prisma: PrismaClient,
  broker: Broker
): Promise<number> {
  const symbol = CASH_SYMBOL_BY_BROKER[broker];
  if (!symbol) return 0;
  const asset = await prisma.asset.findUnique({
    where: { symbol_broker: { symbol, broker } },
  });
  return asset?.quantity ?? 0;
}
