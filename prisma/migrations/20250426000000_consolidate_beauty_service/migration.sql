-- First, migrate data from BeautyService to Service
INSERT INTO "Service" (
  "id",
  "businessId",
  "name",
  "description",
  "duration",
  "price",
  "category",
  "subcategory",
  "isActive",
  "images",
  "virtualTryOn",
  "createdAt",
  "updatedAt",
  "businessProfileId"
)
SELECT 
  bs."id",
  bs."businessId",
  bs."name",
  bs."description",
  bs."duration",
  bs."price",
  bs."category",
  bs."subcategory",
  bs."isActive",
  bs."images",
  bs."virtualTryOn",
  bs."createdAt",
  bs."updatedAt",
  bs."businessProfileId"
FROM "BeautyService" bs
ON CONFLICT (id) DO UPDATE SET
  "businessId" = EXCLUDED."businessId",
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "duration" = EXCLUDED."duration",
  "price" = EXCLUDED."price",
  "category" = EXCLUDED."category",
  "subcategory" = EXCLUDED."subcategory",
  "isActive" = EXCLUDED."isActive",
  "images" = EXCLUDED."images",
  "virtualTryOn" = EXCLUDED."virtualTryOn",
  "updatedAt" = EXCLUDED."updatedAt",
  "businessProfileId" = EXCLUDED."businessProfileId";

-- Migrate practitioner relations
INSERT INTO "_ServicePractitioners" ("A", "B")
SELECT bs."serviceId", bs."practitionerId"
FROM "_BeautyServiceToPractitioner" bs
ON CONFLICT DO NOTHING;

-- Migrate consultation form relations
INSERT INTO "_ServiceForms" ("A", "B")
SELECT bs."serviceId", bs."consultationFormId"
FROM "_BeautyServiceToConsultationForm" bs
ON CONFLICT DO NOTHING;

-- Update foreign keys in related tables
UPDATE "ServiceBooking" SET "serviceId" = bs."id"
FROM "BeautyService" bs
WHERE "ServiceBooking"."serviceId" = bs."id";

UPDATE "ServiceReview" SET "serviceId" = bs."id"
FROM "BeautyService" bs
WHERE "ServiceReview"."serviceId" = bs."id";

UPDATE "VirtualTryOn" SET "serviceId" = bs."id"
FROM "BeautyService" bs
WHERE "VirtualTryOn"."serviceId" = bs."id";

-- Drop old relations and table
DROP TABLE IF EXISTS "_BeautyServiceToPractitioner";
DROP TABLE IF EXISTS "_BeautyServiceToConsultationForm";
DROP TABLE IF EXISTS "BeautyService"; 