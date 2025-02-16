/*
  Warnings:

  - You are about to drop the `app_helps` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "app_helps_configId_appName_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "app_helps";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AppHelp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "appName" TEXT NOT NULL,
    "helpText" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    CONSTRAINT "AppHelp_configId_fkey" FOREIGN KEY ("configId") REFERENCES "user_configs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "theme" TEXT,
    "language" TEXT,
    "cardKeyExpireMinutes" INTEGER,
    CONSTRAINT "user_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_configs" ("cardKeyExpireMinutes", "createdAt", "id", "language", "theme", "title", "updatedAt", "userId") SELECT "cardKeyExpireMinutes", "createdAt", "id", "language", "theme", "title", "updatedAt", "userId" FROM "user_configs";
DROP TABLE "user_configs";
ALTER TABLE "new_user_configs" RENAME TO "user_configs";
CREATE UNIQUE INDEX "user_configs_userId_key" ON "user_configs"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AppHelp_configId_appName_key" ON "AppHelp"("configId", "appName");
