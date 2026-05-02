-- =============================================================================
-- TEST DATABASE SEED SCRIPT
-- =============================================================================
-- This script seeds the test database with sample data for testing
-- Run with: bun run db:seed
-- =============================================================================

SET search_path TO public;

-- Clean up existing test data (if any)
TRUNCATE TABLE
  "public"."Interview",
  "public"."ProofImage",
  "public"."ApplicationMember",
  "public"."Application",
  "public"."CheckIn",
  "public"."Participant",
  "public"."Registration",
  "public"."EventDay",
  "public"."Event",
  "public"."BusinessMember",
  "public"."Sector"
CASCADE;

-- =============================================================================
-- Insert Test Sectors
-- =============================================================================
INSERT INTO "public"."Sector" ("sectorId", "sectorName") VALUES
  (1, 'Accounting'),
  (2, 'Appraisal'),
  (3, 'Automotive'),
  (4, 'Educational Service'),
  (5, 'Energy Production and Utilities'),
  (6, 'Financial and Insurance Services'),
  (7, 'Food Production, Processing and Supply Chain'),
  (8, 'Healthcare Services and Equipment'),
  (9, 'Hospitality and Accomodation'),
  (10, 'Human Resources and Leasing Services'),
  (11, 'Information, Technology, Creativity and Media'),
  (12, 'Legal Professional'),
  (13, 'Management and Business Consulting'),
  (14, 'Manufacturing'),
  (15, 'Pawnshop'),
  (16, 'Real Estate Development and Construction'),
  (17, 'Retail and Commercial Centers'),
  (18, 'Shipping, Tourist Transport, Customs Brokerage, and Logistics');

-- Keep identity sequence aligned after explicit sectorId inserts
SELECT setval(
  pg_get_serial_sequence('"public"."Sector"', 'sectorId'),
  19,
  false
);

-- =============================================================================
-- Insert Test Applications (matching actual schema from migrations)
-- =============================================================================
INSERT INTO "public"."Application" (
  "applicationId",
  "identifier",
  "businessMemberId",
  "sectorName",
  "logoImageURL",
  "applicationType",
  "companyName",
  "companyAddress",
  "landline",
  "mobileNumber",
  "emailAddress",
  "paymentMethod",
  "websiteURL",
  "applicationMemberType",
  "applicationStatus",
  "paymentProofStatus"
) VALUES
  (
    gen_random_uuid(),
    'ibc-app-test001',
    NULL,
    'Information, Technology, Creativity and Media',
    'https://test-company.com/logo.png',
    'newMember',
    'Test Company Inc.',
    '123 Test Street, Manila',
    '02-1234-5678',
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
    'ibc-app-test002',
    NULL,
    'Manufacturing',
    'https://sample-corp.com/logo.png',
    'renewal',
    'Sample Corp.',
    '456 Sample Ave, Quezon City',
    '02-2345-6789',
    '+639181234567',
    'info@sample.com',
    'ONSITE',
    'https://sample-corp.com',
    'corporate',
    'approved',
    'accepted'
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
  FROM "public"."Application"
  WHERE "companyName" = 'Test Company Inc.'
  LIMIT 1;

  -- Get the second application ID
  SELECT "applicationId" INTO app_id_2
  FROM "public"."Application"
  WHERE "companyName" = 'Sample Corp.'
  LIMIT 1;

  -- =============su================================================================
  -- Insert Test Application Members
  -- =============================================================================
  INSERT INTO "public"."ApplicationMember" (
    "applicationMemberId",
    "applicationId",
    "firstName",
    "lastName",
    "emailAddress",
    "mobileNumber",
    "landline",
    "mailingAddress",
    "birthdate",
    "sex",
    "nationality",
    "companyDesignation",
    "companyMemberType"
  ) VALUES

    -- Members for Test Company Inc.
    (
      gen_random_uuid(),
      app_id_1,
      'John',
      'Doe',
      'john.doe@company.com',
      '+639171234567',
      '02-1234-5678',
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
      '123 Test Street, Manila',
      '1992-05-20',
      'Female',
      'Filipino',
      'CTO',
      'alternate'
    ),

    -- Members for Sample Corp.
    (
      gen_random_uuid(),
      app_id_2,
      'Bob',
      'Johnson',
      'bob@sample.com',
      '+639191234567',
      '02-2345-6789',
      '456 Sample Ave, Quezon City',
      '1985-11-30',
      'Male',
      'Filipino',
      'President',
      'principal'
    ),
    (
      gen_random_uuid(),
      app_id_2,
      'Alice',
      'Williams',
      'alice.williams@sample.com',
      '+639201234567',
      '02-2345-6790',
      '456 Sample Ave, Quezon City',
      '1988-07-25',
      'Female',
      'Filipino',
      'CFO',
      'alternate'
    );
END $$;

-- =============================================================================
-- Insert Test Events
-- =============================================================================
INSERT INTO "public"."Event" (
  "eventId",
  "eventTitle",
  "description",
  "eventStartDate",
  "eventEndDate",
  "venue",
  "eventType",
  "registrationFee",
  "eventHeaderUrl",
  "eventPoster",
  "publishedAt"
) VALUES
  -- CHANGED: Published events now include publishedAt timestamp.
  -- Event for Tech Summit 2025
  -- 30 - 32 days from now
  -- Sample Public Event
  (
    gen_random_uuid(),
    'Tech Summit 2025',
    'Annual technology conference',
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '30 days')::timestamp,
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '32 days')::timestamp,
    'Manila Convention Center',
    'public',
    1500.00,
    'https://example.com/tech-summit.jpg',
    'https://example.com/tech-summit-poster.jpg',
    TIMEZONE('UTC', NOW()) - INTERVAL '1 day'
  ),
  -- CHANGED: Use local Supabase storage image for seeded published event.
  -- Sample Private Event
  (
    gen_random_uuid(),
    'Business Networking Night',
    'Monthly networking event for business members',
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '15 days')::timestamp,
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '15 days')::timestamp,
    'Makati Business Club',
    'private',
    500.00,
    'http://127.0.0.1:54321/storage/v1/object/public/headerimage/event-headers/business-networking-night.jpg',
    'http://127.0.0.1:54321/storage/v1/object/public/headerimage/event-posters/business-networking-night-poster.jpg',
    TIMEZONE('UTC', NOW()) - INTERVAL '2 days'
  ),
  -- CHANGED: Draft event intentionally has no header image and no published timestamp.
  -- Sample Draft Event
  (
    gen_random_uuid(),
    'Retail Expo 2025',
    'Exhibition for retail industry innovations',
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '60 days')::timestamp,
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '62 days')::timestamp,
    'SMX Convention Center',
    null,
    2000.00,
    NULL,
    NULL,
    NULL
  );

-- There should also be data for event days for these events

-- =============================================================================
-- Insert Test Users (auth.users)
-- =============================================================================
-- Create a test admin user for Cypress E2E tests
-- Email: admin@test.local
-- Password: Test123!@#
-- No MFA setup for simplified testing
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@test.local',
  extensions.crypt('Test123!@#', extensions.gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Admin", "email_verified": true}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

-- =============================================================================
-- Create Business Members and their primary applications
-- =============================================================================
WITH seeded_business_applications AS (
  INSERT INTO "public"."Application" (
    "applicationId",
    "identifier",
    "businessMemberId",
    "sectorName",
    "logoImageURL",
    "applicationType",
    "companyName",
    "companyAddress",
    "landline",
    "mobileNumber",
    "emailAddress",
    "paymentMethod",
    "websiteURL",
    "applicationMemberType",
    "applicationStatus",
    "paymentProofStatus"
  ) VALUES
    (
      gen_random_uuid(),
      'ibc-app-seed-bm001',
      NULL,
      'Information, Technology, Creativity and Media',
      'https://example.com/business1.jpg',
      'renewal',
      'Business 1',
      'Seed address for Business 1',
      '02-0000-0000',
      '+639000000001',
      'business1.seed@example.com',
      'BPI',
      'https://example.com/business1.com',
      'corporate',
      'approved',
      'accepted'
    ),
    (
      gen_random_uuid(),
      'ibc-app-seed-bm002',
      NULL,
      'Manufacturing',
      'https://example.com/business2.jpg',
      'renewal',
      'Business Corp.',
      'Seed address for Business Corp.',
      '02-0000-0001',
      '+639000000002',
      'businesscorp.seed@example.com',
      'BPI',
      'https://example.com/business2.com',
      'corporate',
      'approved',
      'accepted'
    ),
    (
      gen_random_uuid(),
      'ibc-app-seed-bm003',
      NULL,
      'Management and Business Consulting',
      'https://example.com/business3.jpg',
      'renewal',
      'Company Ltd.',
      'Seed address for Company Ltd.',
      '02-0000-0002',
      '+639000000003',
      'companyltd.seed@example.com',
      'BPI',
      'https://example.com/business3.com',
      'corporate',
      'approved',
      'accepted'
    )
  RETURNING "applicationId", "companyName"
)
INSERT INTO "public"."BusinessMember" (
  "sectorId",
  "logoImageURL",
  "joinDate",
  "websiteURL",
  "businessName",
  "businessMemberId",
  "lastPaymentDate",
  "membershipExpiryDate",
  "membershipStatus",
  "primaryApplicationId"
) VALUES
  (
    11,
    'https://example.com/business1.jpg',
    NOW(),
    'https://example.com/business1.com',
    'Business 1',
    gen_random_uuid(),
    NOW(),
    NOW(),
    'paid',
    (SELECT "applicationId" FROM seeded_business_applications WHERE "companyName" = 'Business 1')
  ),
  (
    14,
    'https://example.com/business2.jpg',
    NOW(),
    'https://example.com/business2.com',
    'Business Corp.',
    gen_random_uuid(),
    NOW(),
    NOW(),
    'paid',
    (SELECT "applicationId" FROM seeded_business_applications WHERE "companyName" = 'Business Corp.')
  ),
  (
    13,
    'https://example.com/business3.jpg',
    NOW(),
    'https://example.com/business3.com',
    'Company Ltd.',
    gen_random_uuid(),
    NOW(),
    NOW(),
    'paid',
    (SELECT "applicationId" FROM seeded_business_applications WHERE "companyName" = 'Company Ltd.')
  );

-- There should also be data for event days for these events

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
  RAISE NOTICE 'Published events with publishedAt: %', (
    SELECT COUNT(*)
    FROM "Event"
    WHERE "eventType" IS NOT NULL
      AND "publishedAt" IS NOT NULL
  );
  RAISE NOTICE 'Draft events with no header image: %', (
    SELECT COUNT(*)
    FROM "Event"
    WHERE "eventType" IS NULL
      AND "eventHeaderUrl" IS NULL
      AND "publishedAt" IS NULL
  );
  RAISE NOTICE 'Business Members: %', (SELECT COUNT(*) FROM "BusinessMember");
  RAISE NOTICE 'Business Members with primaryApplicationId: %', (
    SELECT COUNT(*)
    FROM "BusinessMember"
    WHERE "primaryApplicationId" IS NOT NULL
  );
END $$;
