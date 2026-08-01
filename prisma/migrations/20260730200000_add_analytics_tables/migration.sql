-- CreateTable
CREATE TABLE "InventoryAnalytics" (
    "id" TEXT NOT NULL,
    "partnerInventoryId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "addToCarts" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementScore" (
    "id" TEXT NOT NULL,
    "partnerInventoryId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngagementScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryAnalytics_date_idx" ON "InventoryAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryAnalytics_partnerInventoryId_date_key" ON "InventoryAnalytics"("partnerInventoryId", "date");

-- CreateIndex
CREATE INDEX "EngagementScore_weekStart_idx" ON "EngagementScore"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementScore_partnerInventoryId_weekStart_key" ON "EngagementScore"("partnerInventoryId", "weekStart");

-- AddForeignKey
ALTER TABLE "InventoryAnalytics" ADD CONSTRAINT "InventoryAnalytics_partnerInventoryId_fkey" FOREIGN KEY ("partnerInventoryId") REFERENCES "PartnerInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementScore" ADD CONSTRAINT "EngagementScore_partnerInventoryId_fkey" FOREIGN KEY ("partnerInventoryId") REFERENCES "PartnerInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
