-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- Seed existing static categories so current products remain valid
INSERT INTO "Category" ("id", "name") VALUES
  (lower(hex(randomblob(16))), 'Men'),
  (lower(hex(randomblob(16))), 'Women'),
  (lower(hex(randomblob(16))), 'Sports'),
  (lower(hex(randomblob(16))), 'Luxury'),
  (lower(hex(randomblob(16))), 'New Arrivals');
