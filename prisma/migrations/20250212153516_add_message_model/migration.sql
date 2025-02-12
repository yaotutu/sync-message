/*
  Warnings:

  - Made the column `webhookKey` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_messages" ("content", "createdAt", "id", "updatedAt", "userId") SELECT "content", "createdAt", "id", "updatedAt", "userId" FROM "messages";
DROP TABLE "messages";
ALTER TABLE "new_messages" RENAME TO "messages";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "webhookKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "id", "password", "updatedAt", "username", "webhookKey") SELECT "createdAt", "id", "password", "updatedAt", "username", "webhookKey" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_webhookKey_key" ON "users"("webhookKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
