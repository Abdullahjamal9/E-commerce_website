-- AlterTable
ALTER TABLE "Order" ADD COLUMN "deliveredAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "orderStatusUnlocked" BOOLEAN NOT NULL DEFAULT false;
