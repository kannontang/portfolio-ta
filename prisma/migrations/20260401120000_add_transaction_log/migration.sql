-- CreateEnum
CREATE TYPE "TransactionAction" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ticker" TEXT NOT NULL,
    "action" "TransactionAction" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "exchange" "Exchange" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_ticker_idx" ON "Transaction"("ticker");
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");
CREATE INDEX "Transaction_exchange_idx" ON "Transaction"("exchange");
CREATE INDEX "Transaction_action_idx" ON "Transaction"("action");
