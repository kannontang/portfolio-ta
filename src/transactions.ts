import type { Prisma, PrismaClient, Broker, TransactionAction } from '@prisma/client';
import { CASH_SYMBOL_BY_BROKER } from './cash';

export type CreateTransactionInput = {
  date: Date;
  ticker: string;
  action: TransactionAction;
  quantity: number;
  price: number;
  totalValue: number;
  broker: Broker;
  fee?: number;
  feeCcy?: string;
  realizedPnL?: number | null;
  notes?: string | null;
};

export type TransactionQueryOptions = {
  ticker?: string;
  broker?: Broker;
  action?: TransactionAction;
  from?: Date;
  to?: Date;
  limit?: number;
};

/**
 * Atomically record a transaction AND update holdings + broker cash balance.
 *
 * A BUY:
 *   - validates enough cash is available at the broker
 *   - debits broker cash by (totalValue + fee)
 *   - upserts the holding with a weighted-average cost basis
 *
 * A SELL:
 *   - credits broker cash by (totalValue - fee)
 *   - decrements holding quantity (avgCost unchanged so future realized P/L
 *     still references the original cost basis)
 *   - computes realizedPnL = (price - avgCost) * quantity - fee
 *
 * Everything runs inside `prisma.$transaction` so either all tables move
 * together or nothing moves at all. This eliminates the drift we used to
 * see where trades were logged but cash/holdings weren't updated.
 */
export async function logTransaction(
  prisma: PrismaClient,
  input: CreateTransactionInput
) {
  const ticker = input.ticker.toUpperCase();
  const fee = input.fee ?? 0;
  const feeCcy = input.feeCcy ?? 'USD';
  const cashSymbol = CASH_SYMBOL_BY_BROKER[input.broker];

  return prisma.$transaction(async (tx) => {
    const holding = await tx.asset.findUnique({
      where: { symbol_broker: { symbol: ticker, broker: input.broker } },
    });

    if (input.action === 'BUY') {
      const cashNeeded = input.totalValue + fee;

      // 1. Validate cash (skip for CASH/manual broker where no cash tracking)
      if (cashSymbol) {
        const cashAsset = await tx.asset.findUnique({
          where: { symbol_broker: { symbol: cashSymbol, broker: input.broker } },
        });
        const available = cashAsset?.quantity ?? 0;
        if (available < cashNeeded) {
          throw new Error(
            `Insufficient cash on ${input.broker}: have $${available.toFixed(2)}, need $${cashNeeded.toFixed(2)} (totalValue $${input.totalValue.toFixed(2)} + fee $${fee.toFixed(2)})`
          );
        }
      }

      // 2. Upsert holding with weighted-average cost
      const prevQty = holding?.quantity ?? 0;
      const prevCost = holding?.avgCost ?? 0;
      const newQty = prevQty + input.quantity;
      const newAvgCost =
        newQty > 0
          ? (prevQty * prevCost + input.quantity * input.price) / newQty
          : input.price;

      await tx.asset.upsert({
        where: { symbol_broker: { symbol: ticker, broker: input.broker } },
        update: { quantity: newQty, avgCost: newAvgCost },
        create: {
          symbol: ticker,
          name: holding?.name ?? ticker,
          type: holding?.type ?? 'STOCK',
          broker: input.broker,
          quantity: newQty,
          avgCost: newAvgCost,
        },
      });

      // 3. Debit broker cash
      if (cashSymbol) {
        await tx.asset.update({
          where: { symbol_broker: { symbol: cashSymbol, broker: input.broker } },
          data: { quantity: { decrement: cashNeeded } },
        });
      }

      // 4. Write the trade row
      return tx.transaction.create({
        data: {
          date: input.date,
          ticker,
          action: 'BUY',
          quantity: input.quantity,
          price: input.price,
          totalValue: input.totalValue,
          fee,
          feeCcy,
          realizedPnL: null,
          broker: input.broker,
          notes: input.notes ?? null,
        },
      });
    }

    // SELL
    if (!holding || holding.quantity < input.quantity) {
      throw new Error(
        `Insufficient shares of ${ticker} on ${input.broker}: have ${holding?.quantity ?? 0}, selling ${input.quantity}`
      );
    }

    const avgCost = holding.avgCost ?? 0;
    const realizedPnL =
      input.realizedPnL !== undefined
        ? input.realizedPnL
        : (input.price - avgCost) * input.quantity - fee;

    // Decrement holding (avgCost stays the same)
    const newQty = holding.quantity - input.quantity;
    await tx.asset.update({
      where: { symbol_broker: { symbol: ticker, broker: input.broker } },
      data: { quantity: newQty },
    });

    // Credit broker cash
    if (cashSymbol) {
      const cashDelta = input.totalValue - fee;
      await tx.asset.update({
        where: { symbol_broker: { symbol: cashSymbol, broker: input.broker } },
        data: { quantity: { increment: cashDelta } },
      });
    }

    return tx.transaction.create({
      data: {
        date: input.date,
        ticker,
        action: 'SELL',
        quantity: input.quantity,
        price: input.price,
        totalValue: input.totalValue,
        fee,
        feeCcy,
        realizedPnL,
        broker: input.broker,
        notes: input.notes ?? null,
      },
    });
  });
}

export async function getTransactionHistory(
  prisma: PrismaClient,
  options: TransactionQueryOptions = {}
) {
  const where: Prisma.TransactionWhereInput = {};

  if (options.ticker) {
    where.ticker = options.ticker.toUpperCase();
  }
  if (options.broker) {
    where.broker = options.broker;
  }
  if (options.action) {
    where.action = options.action;
  }
  if (options.from || options.to) {
    where.date = {};
    if (options.from) where.date.gte = options.from;
    if (options.to) where.date.lte = options.to;
  }

  return prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    take: options.limit,
  });
}
