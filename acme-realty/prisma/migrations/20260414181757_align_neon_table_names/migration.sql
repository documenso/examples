/*
  Warnings:

  - You are about to drop the `Addendum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Addendum" DROP CONSTRAINT "Addendum_transactionId_fkey";

-- DropTable
DROP TABLE "Addendum";

-- DropTable
DROP TABLE "Transaction";

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "property" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "buyer_name" TEXT NOT NULL,
    "seller_name" TEXT NOT NULL,
    "buyer_email" TEXT,
    "seller_email" TEXT,
    "buyer_token" TEXT,
    "buyer_signed" BOOLEAN NOT NULL DEFAULT false,
    "seller_token" TEXT,
    "seller_signed" BOOLEAN NOT NULL DEFAULT false,
    "document_id" INTEGER,
    "status" "TransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addendums" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "documenso_document_id" INTEGER NOT NULL,
    "buyer_token" TEXT,
    "seller_token" TEXT,
    "buyer_signed" BOOLEAN NOT NULL DEFAULT false,
    "seller_signed" BOOLEAN NOT NULL DEFAULT false,
    "status" "AddendumStatus" NOT NULL DEFAULT 'SENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addendums_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "addendums_transaction_id_idx" ON "addendums"("transaction_id");

-- AddForeignKey
ALTER TABLE "addendums" ADD CONSTRAINT "addendums_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
