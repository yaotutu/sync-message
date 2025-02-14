/*
  Warnings:

  - You are about to drop the `card_keys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "card_keys";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "simple_card_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "simple_card_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "linked_card_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "appName" TEXT,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "linked_card_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "simple_card_keys_key_key" ON "simple_card_keys"("key");

-- CreateIndex
CREATE INDEX "simple_card_keys_userId_idx" ON "simple_card_keys"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "linked_card_keys_key_key" ON "linked_card_keys"("key");

-- CreateIndex
CREATE INDEX "linked_card_keys_userId_idx" ON "linked_card_keys"("userId");
