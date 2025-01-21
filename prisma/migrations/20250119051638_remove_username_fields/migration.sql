/*
  Warnings:

  - You are about to drop the column `username` on the `card_keys` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `products` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_card_keys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "card_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_card_keys" ("createdAt", "id", "key", "message", "used", "usedAt", "userId") SELECT "createdAt", "id", "key", "message", "used", "usedAt", "userId" FROM "card_keys";
DROP TABLE "card_keys";
ALTER TABLE "new_card_keys" RENAME TO "card_keys";
CREATE UNIQUE INDEX "card_keys_key_key" ON "card_keys"("key");
CREATE TABLE "new_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "link" TEXT NOT NULL,
    "price" REAL,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_products" ("createdAt", "description", "id", "imageUrl", "link", "notes", "price", "title", "updatedAt", "userId") SELECT "createdAt", "description", "id", "imageUrl", "link", "notes", "price", "title", "updatedAt", "userId" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
