-- Add WebAuthn and 2FA fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "currentChallenge" TEXT;

-- Create WebAuthnDevice table
CREATE TABLE IF NOT EXISTS "WebAuthnDevice" (
  "id" TEXT NOT NULL,
  "credentialID" TEXT NOT NULL,
  "publicKey" TEXT NOT NULL,
  "counter" INTEGER NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WebAuthnDevice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WebAuthnDevice_credentialID_key" UNIQUE ("credentialID"),
  CONSTRAINT "WebAuthnDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "WebAuthnDevice_userId_idx" ON "WebAuthnDevice"("userId");

-- Create Authenticator table
CREATE TABLE IF NOT EXISTS "Authenticator" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "credentialID" TEXT NOT NULL,
  "credentialPublicKey" TEXT NOT NULL,
  "counter" INTEGER NOT NULL,
  "transports" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Authenticator_credentialID_key" UNIQUE ("credentialID"),
  CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Authenticator_userId_idx" ON "Authenticator"("userId");

-- Create Challenge table
CREATE TABLE IF NOT EXISTS "Challenge" (
  "id" TEXT NOT NULL,
  "challenge" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Challenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Challenge_userId_idx" ON "Challenge"("userId");

-- Create TwoFactorAuth table
CREATE TABLE IF NOT EXISTS "TwoFactorAuth" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "secret" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TwoFactorAuth_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TwoFactorAuth_userId_key" UNIQUE ("userId"),
  CONSTRAINT "TwoFactorAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "TwoFactorAuth_userId_idx" ON "TwoFactorAuth"("userId");

-- Create BackupCode table
CREATE TABLE IF NOT EXISTS "backup_codes" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "used" BOOLEAN NOT NULL DEFAULT false,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "backup_codes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "backup_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "backup_codes_userId_idx" ON "backup_codes"("userId");

-- Create AuthenticationLog table
CREATE TABLE IF NOT EXISTS "authentication_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "deviceId" TEXT,
  "success" BOOLEAN NOT NULL,
  "errorMessage" TEXT,
  "ipAddress" TEXT NOT NULL,
  "userAgent" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "authentication_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "authentication_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "authentication_logs_userId_idx" ON "authentication_logs"("userId");
CREATE INDEX IF NOT EXISTS "authentication_logs_createdAt_idx" ON "authentication_logs"("createdAt"); 