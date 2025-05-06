-- CreateTable
CREATE TABLE "UserPreferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "theme" TEXT DEFAULT 'system',
  "fontSize" TEXT DEFAULT 'medium',
  "reducedAnimations" BOOLEAN NOT NULL DEFAULT false,
  "highContrast" BOOLEAN NOT NULL DEFAULT false,
  "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
  "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
  "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
  "contentCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "favoriteProducts" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "recentlyViewed" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "shareUsageData" BOOLEAN NOT NULL DEFAULT true,
  "locationTracking" BOOLEAN NOT NULL DEFAULT false,
  "cookiePreferences" JSONB,
  "beautyPreferences" JSONB,
  "accessibilitySettings" JSONB,
  "abTestAssignments" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "page" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT NOT NULL,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "UserPreferences_userId_idx" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; 