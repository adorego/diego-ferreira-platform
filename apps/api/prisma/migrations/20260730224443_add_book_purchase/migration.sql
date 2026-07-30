-- CreateTable
CREATE TABLE "BookPurchase" (
    "id" SERIAL NOT NULL,
    "shopProcessId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "amount" TEXT NOT NULL DEFAULT '12.99',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "downloadToken" TEXT,
    "downloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookPurchase_shopProcessId_key" ON "BookPurchase"("shopProcessId");
