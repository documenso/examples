-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "GigSessionStatus" AS ENUM (
  'PENDING_CLIENT',
  'PENDING_CREATOR',
  'COMPLETED',
  'REJECTED'
);

-- CreateTable
CREATE TABLE "gig_sessions" (
  "id" TEXT NOT NULL,
  "client_email" TEXT NOT NULL,
  "client_name" TEXT NOT NULL,
  "creator_email" TEXT NOT NULL,
  "creator_name" TEXT NOT NULL,
  "deliverables" TEXT NOT NULL,
  "deadline" TEXT NOT NULL,
  "budget" TEXT NOT NULL,
  "usage_rights" TEXT NOT NULL,
  "client_recipient_id" INTEGER,
  "creator_recipient_id" INTEGER,
  "client_token" TEXT,
  "creator_token" TEXT,
  "client_signed" BOOLEAN NOT NULL DEFAULT false,
  "creator_signed" BOOLEAN NOT NULL DEFAULT false,
  "client_signed_at" TIMESTAMP(3),
  "creator_signed_at" TIMESTAMP(3),
  "status" "GigSessionStatus" NOT NULL DEFAULT 'PENDING_CLIENT',
  "document_id" TEXT,
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "gig_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gig_sessions_document_id_key" ON "gig_sessions"("document_id");
