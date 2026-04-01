import type { Prisma, PrismaClient, Exchange, TransactionAction } from '@prisma/client';

export type CreateTransactionInput = {
  date: Date;
  ticker: string;
  action: TransactionAction;
  quantity: number;
  price: number;
  totalValue: number;
  exchange: Exchange;
  notes?: string | null;
};

export type TransactionQueryOptions = {
  ticker?: string;
  exchange?: Exchange;
  action?: TransactionAction;
  from?: Date;
  to?: Date;
  limit?: number;
};

export async function logTransaction(
  prisma: PrismaClient,
  input: CreateTransactionInput
) {
  return prisma.transaction.create({
    data: {
      date: input.date,
      ticker: input.ticker.toUpperCase(),
      action: input.action,
      quantity: input.quantity,
      price: input.price,
      totalValue: input.totalValue,
      exchange: input.exchange,
      notes: input.notes ?? null,
    },
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
  if (options.exchange) {
    where.exchange = options.exchange;
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
