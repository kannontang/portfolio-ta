-- Rename enum type Exchange -> Broker (metadata-only, no data copy)
ALTER TYPE "Exchange" RENAME TO "Broker";

-- Rename Asset.exchange -> Asset.broker
ALTER TABLE "Asset" RENAME COLUMN "exchange" TO "broker";
ALTER INDEX "Asset_exchange_idx" RENAME TO "Asset_broker_idx";
ALTER INDEX "Asset_symbol_exchange_key" RENAME TO "Asset_symbol_broker_key";

-- Rename Transaction.exchange -> Transaction.broker
ALTER TABLE "Transaction" RENAME COLUMN "exchange" TO "broker";
ALTER INDEX "Transaction_exchange_idx" RENAME TO "Transaction_broker_idx";

-- Add fee tracking to Transaction
ALTER TABLE "Transaction" ADD COLUMN "fee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Transaction" ADD COLUMN "feeCcy" TEXT NOT NULL DEFAULT 'USD';
