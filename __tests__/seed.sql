-- =============================================================================
-- TEST DATABASE SEED SCRIPT
-- =============================================================================
-- This script seeds the test database with sample data for testing
-- Run with: bun run db:seed
-- =============================================================================

-- Clean up existing test data (if any)
TRUNCATE TABLE 
  "Interview",
  "ProofImage",
  "ApplicationMember",
  "Application",
  "CheckIn",
  "Participant",
  "Registration",
  "EventDay",
  "Event",
  "BusinessMember",
  "Sector"
CASCADE;

-- =============================================================================
-- Insert Test Sectors
-- =============================================================================
INSERT INTO "Sector" ("sectorId", "sectorName") VALUES
  (1, 'Technology'),
  (2, 'Manufacturing'),
  (3, 'Services'),
  (4, 'Retail')
ON CONFLICT ("sectorId") DO UPDATE SET
  "sectorName" = EXCLUDED."sectorName";

-- =============================================================================
-- Insert Test Applications (matching actual schema from migrations)
-- =============================================================================
INSERT INTO "Application" (
  "applicationId",
  "memberId",
  "sectorId",
  "logoImageURL",
  "applicationType",
  "companyName",
  "companyAddress",
  "landline",
  "faxNumber",
  "mobileNumber",
  "emailAddress",
  "paymentMethod",
  "websiteURL",
  "applicationMemberType",
  "applicationStatus",
  "paymentStatus"
) VALUES
  (
    gen_random_uuid(),
    NULL,
    1,
    'https://test-company.com/logo.png',
    'newMember',
    'Test Company Inc.',
    '123 Test Street, Manila',
    '02-1234-5678',
    '02-8765-4321',
    '+639171234567',
    'test@company.com',
    'BPI',
    'https://test-company.com',
    'corporate',
    'new',
    'pending'
  ),
  (
    gen_random_uuid(),
    NULL,
    2,
    'https://sample-corp.com/logo.png',
    'renewal',
    'Sample Corp.',
    '456 Sample Ave, Quezon City',
    '02-2345-6789',
    '02-9876-5432',
    '+639181234567',
    'info@sample.com',
    'ONSITE',
    'https://sample-corp.com',
    'corporate',
    'approved',
    'verified'
  )
RETURNING "applicationId";

-- Store application IDs for later use
DO $$
DECLARE
  app_id_1 uuid;
  app_id_2 uuid;
BEGIN
  -- Get the first application ID
  SELECT "applicationId" INTO app_id_1 
  FROM "Application" 
  WHERE "companyName" = 'Test Company Inc.' 
  LIMIT 1;
  
  -- Get the second application ID
  SELECT "applicationId" INTO app_id_2 
  FROM "Application" 
  WHERE "companyName" = 'Sample Corp.' 
  LIMIT 1;
  
  -- =============================================================================
  -- Insert Test Application Members
  -- =============================================================================
  INSERT INTO "ApplicationMember" (
    "applicationMemberId",
    "applicationId",
    "firstName",
    "lastName",
    "emailAddress",
    "mobileNumber",
    "landline",
    "faxNumber",
    "mailingAddress",
    "birthdate",
    "sex",
    "nationality",
    "companyDesignation",
    "companyMemberType"
  ) VALUES
    (
      gen_random_uuid(),
      app_id_1,
      'John',
      'Doe',
      'john.doe@company.com',
      '+639171234567',
      '02-1234-5678',
      '02-8765-4321',
      '123 Test Street, Manila',
      '1990-01-15',
      'Male',
      'Filipino',
      'CEO',
      'principal'
    ),
    (
      gen_random_uuid(),
      app_id_1,
      'Jane',
      'Smith',
      'jane.smith@company.com',
      '+639181234567',
      '02-1234-5679',
      '02-8765-4322',
      '123 Test Street, Manila',
      '1992-05-20',
      'Female',
      'Filipino',
      'CTO',
      'alternate'
    ),
    (
      gen_random_uuid(),
      app_id_2,
      'Bob',
      'Johnson',
      'bob@sample.com',
      '+639191234567',
      '02-2345-6789',
      '02-9876-5432',
      '456 Sample Ave, Quezon City',
      '1985-11-30',
      'Male',
      'Filipino',
      'President',
      'principal'
    );
END $$;

-- =============================================================================
-- Insert Test Events
-- =============================================================================
INSERT INTO "Event" (
  "eventId",
  "eventTitle",
  "description",
  "eventStartDate",
  "eventEndDate",
  "venue",
  "eventType",
  "registrationFee",
  "eventHeaderUrl"
) VALUES
  (
    gen_random_uuid(),
    'Tech Summit 2024',
    'Annual technology conference',
    (NOW() + INTERVAL '30 days')::timestamp,
    (NOW() + INTERVAL '32 days')::timestamp,
    'Manila Convention Center',
    'public',
    1500.00,
    'https://example.com/tech-summit.jpg'
  ),
  (
    gen_random_uuid(),
    'Business Networking Night',
    'Monthly networking event for business members',
    (NOW() + INTERVAL '15 days')::timestamp,
    (NOW() + INTERVAL '15 days')::timestamp,
    'Makati Business Club',
    'private',
    500.00,
    'https://example.com/networking.jpg'
  );

-- =============================================================================
-- Verify Seed Data
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Test data seeded successfully!';
  RAISE NOTICE 'Sectors: %', (SELECT COUNT(*) FROM "Sector");
  RAISE NOTICE 'Applications: %', (SELECT COUNT(*) FROM "Application");
  RAISE NOTICE 'Application Members: %', (SELECT COUNT(*) FROM "ApplicationMember");
  RAISE NOTICE 'Events: %', (SELECT COUNT(*) FROM "Event");
END $$;
