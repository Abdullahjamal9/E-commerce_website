-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- Seed the former static category list as Tags
INSERT INTO "Tag" ("id", "name") VALUES
  (lower(hex(randomblob(16))), 'Men'),
  (lower(hex(randomblob(16))), 'Women'),
  (lower(hex(randomblob(16))), 'Sports'),
  (lower(hex(randomblob(16))), 'Luxury'),
  (lower(hex(randomblob(16))), 'New Arrivals');

-- AlterTable: split Product.categories into category (single) + tags (array)
ALTER TABLE "Product" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Shoes';
ALTER TABLE "Product" ADD COLUMN "tags" TEXT NOT NULL DEFAULT '[]';

-- Backfill: the old "categories" array was always Men/Women/Sports/Luxury/New
-- Arrivals values, so it maps directly onto the new "tags" column.
UPDATE "Product" SET "tags" = "categories";

ALTER TABLE "Product" DROP COLUMN "categories";
