/*
  Warnings:

  - You are about to drop the column `expiresIn` on the `card_keys` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `card_keys` table. All the data in the column will be lost.
  - You are about to drop the column `usedAt` on the `card_keys` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `card_keys` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_card_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "card_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_card_keys" ("createdAt", "id", "key", "userId") SELECT "createdAt", "id", "key", "userId" FROM "card_keys";
DROP TABLE "card_keys";
ALTER TABLE "new_card_keys" RENAME TO "card_keys";
CREATE UNIQUE INDEX "card_keys_key_key" ON "card_keys"("key");
CREATE TABLE "new_user_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "theme" TEXT,
    "language" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "user_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_configs" ("createdAt", "id", "language", "theme", "updatedAt", "userId") SELECT "createdAt", "id", "language", "theme", "updatedAt", "userId" FROM "user_configs";
DROP TABLE "user_configs";
ALTER TABLE "new_user_configs" RENAME TO "user_configs";
CREATE UNIQUE INDEX "user_configs_userId_key" ON "user_configs"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
