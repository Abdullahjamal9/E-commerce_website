-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "generalSaleEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Settings" ADD COLUMN "generalSaleEndsAt" DATETIME;
