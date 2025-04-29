-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "refundAmount" DOUBLE PRECISION,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "_BeautyServiceToConsultationForm" ADD CONSTRAINT "_BeautyServiceToConsultationForm_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_BeautyServiceToConsultationForm_AB_unique";

-- AlterTable
ALTER TABLE "_BeautyServiceToServicePackage" ADD CONSTRAINT "_BeautyServiceToServicePackage_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_BeautyServiceToServicePackage_AB_unique";

-- AlterTable
ALTER TABLE "_ServiceToServiceAttribute" ADD CONSTRAINT "_ServiceToServiceAttribute_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ServiceToServiceAttribute_AB_unique";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentChallenge" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "WebAuthnDevice" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebAuthnDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebAuthnDevice_credentialId_key" ON "WebAuthnDevice"("credentialId");

-- CreateIndex
CREATE INDEX "WebAuthnDevice_userId_idx" ON "WebAuthnDevice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");

-- CreateIndex
CREATE INDEX "EmailVerification_token_idx" ON "EmailVerification"("token");

-- CreateIndex
CREATE INDEX "EmailVerification_userId_idx" ON "EmailVerification"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- AddForeignKey
ALTER TABLE "WebAuthnDevice" ADD CONSTRAINT "WebAuthnDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
