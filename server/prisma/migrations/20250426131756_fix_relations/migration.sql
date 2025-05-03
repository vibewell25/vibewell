/*
  Warnings:

  - You are about to drop the column `userId` on the `EquipmentAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `EquipmentItem` table. All the data in the column will be lost.
  - The primary key for the `GoogleCalendarToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `expiryDate` column on the `GoogleCalendarToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `sku` on the `InventoryItem` table. All the data in the column will be lost.
  - The primary key for the `OutlookCalendarToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `expiryDate` column on the `OutlookCalendarToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `GoogleCalendarToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `OutlookCalendarToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assignedTo` to the `EquipmentAssignment` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `GoogleCalendarToken` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `OutlookCalendarToken` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "EquipmentAssignment" DROP CONSTRAINT "EquipmentAssignment_userId_fkey";

-- DropIndex
DROP INDEX "EquipmentItem_serialNumber_key";

-- DropIndex
DROP INDEX "InventoryItem_sku_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "googleEventId" TEXT,
ADD COLUMN     "outlookEventId" TEXT;

-- AlterTable
ALTER TABLE "EquipmentAssignment" DROP COLUMN "userId",
ADD COLUMN     "assignedTo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EquipmentItem" DROP COLUMN "status",
ADD COLUMN     "description" TEXT,
ALTER COLUMN "serialNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GoogleCalendarToken" DROP CONSTRAINT "GoogleCalendarToken_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "tokenType" TEXT,
ALTER COLUMN "scope" DROP NOT NULL,
DROP COLUMN "expiryDate",
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "GoogleCalendarToken_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "sku",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "OutlookCalendarToken" DROP CONSTRAINT "OutlookCalendarToken_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "tokenType" TEXT,
ALTER COLUMN "scope" DROP NOT NULL,
DROP COLUMN "expiryDate",
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "OutlookCalendarToken_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarToken_userId_key" ON "GoogleCalendarToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OutlookCalendarToken_userId_key" ON "OutlookCalendarToken"("userId");

-- AddForeignKey
ALTER TABLE "EquipmentAssignment" ADD CONSTRAINT "EquipmentAssignment_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
