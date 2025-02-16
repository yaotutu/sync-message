-- CreateTable
CREATE TABLE "app_helps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appName" TEXT NOT NULL,
    "helpText" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "app_helps_configId_fkey" FOREIGN KEY ("configId") REFERENCES "user_configs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "app_helps_configId_appName_key" ON "app_helps"("configId", "appName");
