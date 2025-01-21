/*
  Warnings:

  - You are about to drop the column `username` on the `user_configs` table. All the data in the column will be lost.
  - Added the required column `userId` to the `card_keys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `user_configs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

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
    "username" TEXT NOT NULL,
    CONSTRAINT "card_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_card_keys" ("createdAt", "id", "key", "message", "used", "usedAt", "username") SELECT "createdAt", "id", "key", "message", "used", "usedAt", "username" FROM "card_keys";
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
    "username" TEXT NOT NULL,
    CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_products" ("createdAt", "description", "id", "imageUrl", "link", "notes", "price", "title", "updatedAt", "username") SELECT "createdAt", "description", "id", "imageUrl", "link", "notes", "price", "title", "updatedAt", "username" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE TABLE "new_user_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageTitle" TEXT,
    "pageDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "user_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_configs" ("createdAt", "id", "pageDescription", "pageTitle", "updatedAt") SELECT "createdAt", "id", "pageDescription", "pageTitle", "updatedAt" FROM "user_configs";
DROP TABLE "user_configs";
ALTER TABLE "new_user_configs" RENAME TO "user_configs";
CREATE UNIQUE INDEX "user_configs_userId_key" ON "user_configs"("userId");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "id", "password", "username") SELECT "createdAt", "id", "password", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
