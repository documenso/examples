-- CreateTable
CREATE TABLE "app_states" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "projects" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_states_key_key" ON "app_states"("key");
