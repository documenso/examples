-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('DRAFT', 'UNDER_CONTRACT', 'CLOSED');

-- CreateEnum
CREATE TYPE "AddendumStatus" AS ENUM ('SENT', 'COMPLETED');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "property" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "buyerEmail" TEXT,
    "sellerEmail" TEXT,
    "buyerToken" TEXT,
    "buyerSigned" BOOLEAN NOT NULL DEFAULT false,
    "sellerToken" TEXT,
    "sellerSigned" BOOLEAN NOT NULL DEFAULT false,
    "documentId" INTEGER,
    "status" "TransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addendum" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "documensoDocumentId" INTEGER NOT NULL,
    "buyerToken" TEXT,
    "sellerToken" TEXT,
    "buyerSigned" BOOLEAN NOT NULL DEFAULT false,
    "sellerSigned" BOOLEAN NOT NULL DEFAULT false,
    "status" "AddendumStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Addendum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Addendum_transactionId_idx" ON "Addendum"("transactionId");

-- AddForeignKey
ALTER TABLE "Addendum" ADD CONSTRAINT "Addendum_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
