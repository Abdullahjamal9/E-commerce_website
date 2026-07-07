-- RedefineTables (SQLite has no ALTER COLUMN TYPE, so rebuild with size as TEXT)
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "colorName" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_OrderItem" ("id", "orderId", "productId", "productName", "price", "colorName", "colorHex", "size", "qty", "image")
SELECT "id", "orderId", "productId", "productName", "price", "colorName", "colorHex", CAST("size" AS TEXT), "qty", "image" FROM "OrderItem";

DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";

PRAGMA foreign_keys=ON;
