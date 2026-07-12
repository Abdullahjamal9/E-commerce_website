-- AlterTable
ALTER TABLE "Product" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill: preserve the current "newest first" display order as the initial
-- manual order, so existing listings don't visibly reshuffle on deploy.
UPDATE "Product" SET "sortOrder" = (
  SELECT COUNT(*) FROM "Product" AS p2 WHERE p2."createdAt" > "Product"."createdAt"
);
