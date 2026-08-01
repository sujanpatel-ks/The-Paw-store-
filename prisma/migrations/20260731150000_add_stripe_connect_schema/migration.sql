-- CreateEnum
CREATE TYPE "StripeAccountStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'ACTIVE', 'RESTRICTED', 'DISABLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- AlterTable
ALTER TABLE "PartnerStore" ADD COLUMN "stripeAccountId" TEXT,
ADD COLUMN "stripeOnboardingUrl" TEXT,
ADD COLUMN "stripeAccountStatus" "StripeAccountStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentIntentId" TEXT,
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID';

-- CreateTable
CREATE TABLE "StripeWebhookLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeWebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerStore_stripeAccountId_key" ON "PartnerStore"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentIntentId_key" ON "Order"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeWebhookLog_eventId_key" ON "StripeWebhookLog"("eventId");

-- CreateIndex
CREATE INDEX "StripeWebhookLog_eventId_idx" ON "StripeWebhookLog"("eventId");

-- CreateIndex
CREATE INDEX "StripeWebhookLog_type_idx" ON "StripeWebhookLog"("type");
