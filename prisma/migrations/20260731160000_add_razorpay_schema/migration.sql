-- CreateEnum
CREATE TYPE "RazorpayAccountStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- AlterTable
ALTER TABLE "PartnerStore" ADD COLUMN "razorpayAccountId" TEXT,
ADD COLUMN "razorpayAccountStatus" "RazorpayAccountStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "razorpayOrderId" TEXT,
ADD COLUMN "razorpayPaymentId" TEXT,
ADD COLUMN "razorpaySignature" TEXT,
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "refundedAt" TIMESTAMP(3),
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'INR';

-- CreateTable
CREATE TABLE "RazorpayWebhookLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "RazorpayWebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerStore_razorpayAccountId_key" ON "PartnerStore"("razorpayAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpayPaymentId_key" ON "Order"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "RazorpayWebhookLog_eventId_key" ON "RazorpayWebhookLog"("eventId");

-- CreateIndex
CREATE INDEX "RazorpayWebhookLog_eventId_idx" ON "RazorpayWebhookLog"("eventId");

-- CreateIndex
CREATE INDEX "RazorpayWebhookLog_event_idx" ON "RazorpayWebhookLog"("event");
