-- DropTable
DROP TABLE IF EXISTS "PartnerInventory";

-- CreateTable
CREATE TABLE "PartnerInventory" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "shelfImageUrl" TEXT,
    "cloudinaryPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerInventory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PartnerInventory" ADD CONSTRAINT "PartnerInventory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "PartnerStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerInventory" ADD CONSTRAINT "PartnerInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
