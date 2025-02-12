/*
  Warnings:

  - You are about to drop the column `link` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[webhookKey]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- 添加 webhookKey 列到 users 表
ALTER TABLE "users" ADD COLUMN "webhookKey" TEXT;
CREATE UNIQUE INDEX "users_webhookKey_key" ON "users"("webhookKey");

-- 清空旧的产品表
DELETE FROM "products";

-- 修改产品表结构
DROP TABLE "products";
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL,
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
