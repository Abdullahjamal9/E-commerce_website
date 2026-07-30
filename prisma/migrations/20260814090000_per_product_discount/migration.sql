-- AlterTable
ALTER TABLE "Product" ADD COLUMN "discountPercent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "salePercent";
ALTER TABLE "Settings" DROP COLUMN "saleLabel";
