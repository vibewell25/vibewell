/*
  Warnings:

  - You are about to drop the column `image` on the `BeautyService` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `ContentProgress` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ContentProgress` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ContentProgress` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `ServiceBooking` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `ServiceReview` table. All the data in the column will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Business` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Challenge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoyaltyTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentIntent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `alert_thresholds` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dashboard_notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `encrypted_user_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `security_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `share_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shares` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `try_on_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_badges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_notification_preferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_points` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[credentialId]` on the table `WebAuthnAuthenticator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `BeautyService` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `progress` to the `ContentProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_userId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceReview" DROP CONSTRAINT "ServiceReview_bookingId_fkey";

-- DropIndex
DROP INDEX "ServiceReview_bookingId_key";

-- DropIndex
DROP INDEX "WebAuthnAuthenticator_credentialId_idx";

-- AlterTable
ALTER TABLE "BeautyService" DROP COLUMN "image",
ADD COLUMN     "category" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "content",
DROP COLUMN "tags",
ADD COLUMN     "url" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContentProgress" DROP COLUMN "completed",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "ServiceBooking" DROP COLUMN "time";

-- AlterTable
ALTER TABLE "ServiceReview" DROP COLUMN "bookingId";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Business";

-- DropTable
DROP TABLE "Challenge";

-- DropTable
DROP TABLE "LoyaltyTransaction";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "PaymentIntent";

-- DropTable
DROP TABLE "Tip";

-- DropTable
DROP TABLE "alert_thresholds";

-- DropTable
DROP TABLE "dashboard_notifications";

-- DropTable
DROP TABLE "encrypted_user_data";

-- DropTable
DROP TABLE "messages";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "security_events";

-- DropTable
DROP TABLE "share_analytics";

-- DropTable
DROP TABLE "shares";

-- DropTable
DROP TABLE "try_on_sessions";

-- DropTable
DROP TABLE "user_badges";

-- DropTable
DROP TABLE "user_notification_preferences";

-- DropTable
DROP TABLE "user_notifications";

-- DropTable
DROP TABLE "user_points";

-- DropEnum
DROP TYPE "ContentType";

-- CreateTable
CREATE TABLE "WebAuthnChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebAuthnChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebAuthnChallenge_userId_idx" ON "WebAuthnChallenge"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Content_authorId_idx" ON "Content"("authorId");

-- CreateIndex
CREATE INDEX "ContentProgress_userId_idx" ON "ContentProgress"("userId");

-- CreateIndex
CREATE INDEX "ContentProgress_contentId_idx" ON "ContentProgress"("contentId");

-- CreateIndex
CREATE INDEX "ServiceBooking_userId_idx" ON "ServiceBooking"("userId");

-- CreateIndex
CREATE INDEX "ServiceBooking_providerId_idx" ON "ServiceBooking"("providerId");

-- CreateIndex
CREATE INDEX "ServiceBooking_serviceId_idx" ON "ServiceBooking"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceReview_userId_idx" ON "ServiceReview"("userId");

-- CreateIndex
CREATE INDEX "ServiceReview_serviceId_idx" ON "ServiceReview"("serviceId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WebAuthnAuthenticator_credentialId_key" ON "WebAuthnAuthenticator"("credentialId");

-- AddForeignKey
ALTER TABLE "WebAuthnChallenge" ADD CONSTRAINT "WebAuthnChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
