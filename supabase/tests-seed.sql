-- =============================================================================
-- USABILITY TEST SEED DATA
-- =============================================================================
-- Prerequisite: Run supabase/seed.sql first
-- Run: psql "$DATABASE_URL" -f supabase/seed.sql -f supabase/tests-seed.sql
--
-- This file seeds data for all 28 usability test scenarios defined in
-- Softdev Lab Client Docs.md (Usability Test Plan v1, April 29, 2026).
--
-- Deterministic IDs (cleanup-safe, re-runnable):
--   Events:                11111111-1111-4111-8111-1111111111xx
--   BusinessMembers:       22222222-2222-4222-8222-2222222222xx
--   Applications:          33333333-3333-4333-8333-3333333333xx
--   Registrations:         44444444-4444-4444-8444-4444444444xx
--   Participants:          55555555-5555-4555-8555-5555555555xx
--   CheckIns:              66666666-6666-4666-8666-6666666666xx
--   ProofImages:           77777777-7777-4777-8777-7777777777xx
--   Evaluations:           88888888-8888-4888-8888-8888888888xx
--   SponsoredRegistrations: 99999999-9999-4999-8999-9999999999xx
--   Networks:              aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaxx
--   Interviews:            bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbx
-- =============================================================================

SET search_path TO public;

-- =============================================================================
-- CLEANUP: Remove previous test seed data (FK-safe order)
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '🧹 Cleaning up previous test seed data...';

  DELETE FROM "public"."CheckIn"
  WHERE "checkInId"::text LIKE '66666666-%';

  DELETE FROM "public"."ProofImage"
  WHERE "proofImageId"::text LIKE '77777777-%';

  DELETE FROM "public"."Participant"
  WHERE "participantId"::text LIKE '55555555-%';

  DELETE FROM "public"."Registration"
  WHERE "registrationId"::text LIKE '44444444-%';

  DELETE FROM "public"."EvaluationForm"
  WHERE "evaluationId"::text LIKE '88888888-%';

  DELETE FROM "public"."SponsoredRegistration"
  WHERE "sponsoredRegistrationId"::text LIKE '99999999-%';

  DELETE FROM "public"."ApplicationMember"
  WHERE "applicationMemberId"::text LIKE '33333333-%';

  DELETE FROM "public"."Interview"
  WHERE "interviewId"::text LIKE 'bbbbbbbb-%';

  -- Delete BMs first (cascades to delete linked Applications via businessMemberId FK)
  DELETE FROM "public"."BusinessMember"
  WHERE "businessMemberId"::text LIKE '22222222-%';

  -- Clean up any remaining standalone test applications
  DELETE FROM "public"."Application"
  WHERE "applicationId"::text LIKE '33333333-%';

  -- EventDays get auto-created by trigger; delete them before the parent Event
  DELETE FROM "public"."EventDay"
  WHERE "eventId"::text LIKE '11111111-%';

  DELETE FROM "public"."Event"
  WHERE "eventId"::text LIKE '11111111-%';

  DELETE FROM "public"."Networks"
  WHERE "id"::text LIKE 'aaaaaaaa-%';

  RAISE NOTICE '✅ Cleanup complete';
END $$;

-- =============================================================================
-- SECTION: Networks (Scenario G3 — Checking Networks of IBC)
-- =============================================================================
-- Requirement: 6 networks populated
-- Completion: User sees 6 networks in the networks page
DO $$
BEGIN
  RAISE NOTICE '📡 Seeding Networks for G3...';
END $$;

INSERT INTO "public"."Networks" ("id", "organization", "about", "location_type", "representative_name", "representative_position", "logo_url")
VALUES
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
    'Philippine Chamber of Commerce and Industry',
    'The largest business organization in the Philippines, representing the interests of businesses nationwide.',
    'national',
    'Maria Santos',
    'President',
    'http://127.0.0.1:54321/storage/v1/object/public/network-logos/test-network-1.png'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
    'Iloilo Economic Development Foundation',
    'Promotes sustainable economic growth and investment opportunities in Iloilo.',
    'local',
    'Jose Rodriguez',
    'Executive Director',
    'http://127.0.0.1:54321/storage/v1/object/public/network-logos/test-network-2.png'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03',
    'Western Visayas Agri-Industrial Council',
    'Advances the agricultural and industrial sectors in Western Visayas.',
    'regional',
    'Ana Reyes',
    'Chairperson',
    'http://127.0.0.1:54321/storage/v1/object/public/network-logos/test-network-3.png'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04',
    'ASEAN Business Advisory Council Philippines',
    'Provides private sector feedback to ASEAN leaders on economic integration.',
    'international',
    'Carlos Tan',
    'Council Member',
    'http://127.0.0.1:54321/storage/v1/object/public/network-logos/test-network-4.png'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05',
    'Micro, Small and Medium Enterprise Development Council',
    'Supports MSME growth through policy advocacy and capacity building programs.',
    'national',
    'Lucia Cruz',
    'Vice Chair',
    'http://127.0.0.1:54321/storage/v1/object/public/network-logos/test-network-5.png'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06',
    'Iloilo City Tourism and Development Office',
    'Drives tourism-related economic activity and business development in Iloilo City.',
    'local',
    'Marco Villanueva',
    'Director',
    'http://127.0.0.1:54321/storage/v1/object/public/network-logos/test-network-6.png'
  );

-- =============================================================================
-- SECTION: Events (Scenarios G1, G4, G5, A1-A4, A15, G11, G14)
-- =============================================================================
-- G1 needs: 3 upcoming public events + 2-3 past events
-- G4 needs: 1 upcoming public event (reuse)
-- G5 needs: 1 upcoming private event
-- A15 needs: 1 past event with facebookLink
-- G11 needs: 1 past event (for evaluation)
-- G14 needs: 1 past event (for sponsored link)

DO $$
DECLARE
  v_event_1_id uuid := '11111111-1111-4111-8111-111111111101';
  v_event_2_id uuid := '11111111-1111-4111-8111-111111111102';
  v_event_3_id uuid := '11111111-1111-4111-8111-111111111103';
  v_event_4_id uuid := '11111111-1111-4111-8111-111111111104';
  v_event_5_id uuid := '11111111-1111-4111-8111-111111111105';
  v_event_6_id uuid := '11111111-1111-4111-8111-111111111106';
  v_header_base_url text := 'http://127.0.0.1:54321/storage/v1/object/public/headerimage/event-headers/';
  v_poster_base_url text := 'http://127.0.0.1:54321/storage/v1/object/public/headerimage/event-posters/';
BEGIN
  RAISE NOTICE '📅 Seeding Events for G1, G4, G5, A1-A4, A15, G11, G14...';

  -- Event 1: Upcoming Public (14-15 days from now, 2 days) — G1, G4, A1-A4, G12
  INSERT INTO "public"."Event" ("eventId", "eventTitle", "description", "eventStartDate", "eventEndDate", "venue", "eventType", "registrationFee", "eventHeaderUrl", "eventPoster", "publishedAt")
  VALUES (
    v_event_1_id,
    'IBC Annual General Assembly 2026',
    'Join us for the Iloilo Business Club''s flagship annual event featuring keynote speakers, networking opportunities, and industry updates. This two-day event brings together business leaders from across the region.',
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '14 days')::timestamp,
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '15 days')::timestamp,
    'Iloilo Convention Center',
    'public',
    1500.00,
    v_header_base_url || 'test-event-upcoming-1.jpg',
    v_poster_base_url || 'test-poster-upcoming-1.jpg',
    TIMEZONE('UTC', NOW()) - INTERVAL '3 days'
  );

  -- Event 2: Upcoming Public (21-22 days from now) — G1
  INSERT INTO "public"."Event" ("eventId", "eventTitle", "description", "eventStartDate", "eventEndDate", "venue", "eventType", "registrationFee", "eventHeaderUrl", "eventPoster", "publishedAt")
  VALUES (
    v_event_2_id,
    'Regional Business Innovation Summit',
    'Explore the latest trends in digital transformation, sustainable business practices, and regional economic development with expert panels and workshops.',
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '21 days')::timestamp,
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '22 days')::timestamp,
    'Richmonde Hotel Iloilo',
    'public',
    2000.00,
    v_header_base_url || 'test-event-upcoming-2.jpg',
    v_poster_base_url || 'test-poster-upcoming-2.jpg',
    TIMEZONE('UTC', NOW()) - INTERVAL '2 days'
  );

  -- Event 3: Upcoming Public (45-47 days from now) — G1
  INSERT INTO "public"."Event" ("eventId", "eventTitle", "description", "eventStartDate", "eventEndDate", "venue", "eventType", "registrationFee", "eventHeaderUrl", "eventPoster", "publishedAt")
  VALUES (
    v_event_3_id,
    'MSME Growth and Development Conference',
    'A conference dedicated to micro, small, and medium enterprises. Learn about financing options, digital tools, and market expansion strategies.',
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '45 days')::timestamp,
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '47 days')::timestamp,
    'SMX Convention Center Iloilo',
    'public',
    800.00,
    v_header_base_url || 'test-event-upcoming-3.jpg',
    v_poster_base_url || 'test-poster-upcoming-3.jpg',
    TIMEZONE('UTC', NOW()) - INTERVAL '5 days'
  );

  -- Event 4: Upcoming Private (10 days from now, 1 day) — G5
  INSERT INTO "public"."Event" ("eventId", "eventTitle", "description", "eventStartDate", "eventEndDate", "venue", "eventType", "registrationFee", "eventHeaderUrl", "eventPoster", "publishedAt")
  VALUES (
    v_event_4_id,
    'IBC Members-Only Quarterly Meeting',
    'Exclusive quarterly meeting for IBC members. Agenda includes membership updates, committee reports, and closed-door discussions on advocacy priorities.',
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '10 days')::timestamp,
    date_trunc('day', TIMEZONE('UTC', NOW()) + INTERVAL '10 days')::timestamp,
    'IBC Office Conference Room, Marymart Iloilo',
    'private',
    500.00,
    v_header_base_url || 'test-event-private.jpg',
    v_poster_base_url || 'test-poster-private.jpg',
    TIMEZONE('UTC', NOW()) - INTERVAL '4 days'
  );

  -- Event 5: Past Public (10-8 days ago) — G1, A15 (facebook link)
  INSERT INTO "public"."Event" ("eventId", "eventTitle", "description", "eventStartDate", "eventEndDate", "venue", "eventType", "registrationFee", "eventHeaderUrl", "eventPoster", "publishedAt", "facebookLink")
  VALUES (
    v_event_5_id,
    'Agri-Business Forum 2026',
    'A forum discussing the future of agri-business in Western Visayas, covering sustainable farming, export opportunities, and technology adoption.',
    date_trunc('day', TIMEZONE('UTC', NOW()) - INTERVAL '10 days')::timestamp,
    date_trunc('day', TIMEZONE('UTC', NOW()) - INTERVAL '8 days')::timestamp,
    'Iloilo Business Park',
    'public',
    1000.00,
    v_header_base_url || 'test-event-past-1.jpg',
    v_poster_base_url || 'test-poster-past-1.jpg',
    TIMEZONE('UTC', NOW()) - INTERVAL '15 days',
    'https://www.facebook.com/IloiloBusinessClub/posts/pfbid0ExampleLink1'
  );

  -- Event 6: Past Public (20-18 days ago) — G1, G11 (evaluation), A19-A20 (evaluations), G14 (sponsored past)
  INSERT INTO "public"."Event" ("eventId", "eventTitle", "description", "eventStartDate", "eventEndDate", "venue", "eventType", "registrationFee", "eventHeaderUrl", "eventPoster", "publishedAt")
  VALUES (
    v_event_6_id,
    'IBC Networking Night 2026',
    'An evening of networking among IBC members and guests. Featuring speed networking sessions, industry roundtables, and cocktails.',
    date_trunc('day', TIMEZONE('UTC', NOW()) - INTERVAL '20 days')::timestamp,
    date_trunc('day', TIMEZONE('UTC', NOW()) - INTERVAL '18 days')::timestamp,
    'Seda Atria Hotel Iloilo',
    'public',
    1200.00,
    v_header_base_url || 'test-event-past-2.jpg',
    v_poster_base_url || 'test-poster-past-2.jpg',
    TIMEZONE('UTC', NOW()) - INTERVAL '25 days'
  );

  RAISE NOTICE '✅ 6 events seeded (3 upcoming public, 1 upcoming private, 2 past)';
END $$;

-- =============================================================================
-- SECTION: Business Members + Primary Applications
-- =============================================================================
-- BM1: Paid member for G5 (member registration), G6 (directory display)
-- BM2: Cancelled member with known identifier for G8 (renewal with cancelled)
-- BM3: Paid member with personal-type primary for G9 (personal → corporate)
-- BM4: Featured member for A10
-- BM5: Non-featured member for A10
-- BM6: Unpaid member for A11 (bulk status update)
-- BM7: Member with full application history for A12

DO $$
DECLARE
  v_bm1_id uuid := '22222222-2222-4222-8222-222222222201';
  v_bm2_id uuid := '22222222-2222-4222-8222-222222222202';
  v_bm3_id uuid := '22222222-2222-4222-8222-222222222203';
  v_bm4_id uuid := '22222222-2222-4222-8222-222222222204';
  v_bm5_id uuid := '22222222-2222-4222-8222-222222222205';
  v_bm6_id uuid := '22222222-2222-4222-8222-222222222206';
  v_bm7_id uuid := '22222222-2222-4222-8222-222222222207';

  v_app_bm1_id uuid := '33333333-3333-4333-8333-333333333301';
  v_app_bm2_id uuid := '33333333-3333-4333-8333-333333333302';
  v_app_bm3_id uuid := '33333333-3333-4333-8333-333333333303';
  v_app_bm4_id uuid := '33333333-3333-4333-8333-333333333304';
  v_app_bm5_id uuid := '33333333-3333-4333-8333-333333333305';
  v_app_bm6_id uuid := '33333333-3333-4333-8333-333333333306';
  v_app_bm7_init uuid := '33333333-3333-4333-8333-333333333307';
  v_app_bm7_renewal uuid := '33333333-3333-4333-8333-333333333308';
  v_app_bm7_update uuid := '33333333-3333-4333-8333-333333333309';

  v_logo_url text := 'http://127.0.0.1:54321/storage/v1/object/public/logoimage/';
BEGIN
  RAISE NOTICE '👥 Seeding Business Members + Primary Applications for G5, G6, G8, G9, A9-A12...';

  ---------------------------------------------------------------------------
  -- BM7 (history) Applications: Insert BEFORE the BM (since BM7 has its own insert)
  -- Note: We insert BM7 last for A12 after all 3 apps, then link the primary
  ---------------------------------------------------------------------------

  -- BM7 Initial App (newMember, approved)
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    v_app_bm7_init,
    'ibc-app-testa1201',
    NULL, -- will be linked after BM7 insert
    'Information, Technology, Creativity and Media',
    v_logo_url || 'test-bm-history.jpg',
    'newMember',
    'Heritage Builders',
    '789 Heritage Ave, Iloilo City',
    '033-555-0101',
    '+639471111111',
    'info@heritagebuilders.test',
    'BPI',
    'https://heritagebuilders.test',
    'corporate',
    'approved',
    'accepted'
  );

  -- BM7 Renewal App (renewal, approved)
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    v_app_bm7_renewal,
    'ibc-app-testa1202',
    NULL,
    'Information, Technology, Creativity and Media',
    v_logo_url || 'test-bm-history.jpg',
    'renewal',
    'Heritage Builders',
    '789 Heritage Ave, Iloilo City',
    '033-555-0202',
    '+639472222222',
    'renewal@heritagebuilders.test',
    'BPI',
    'https://heritagebuilders.test',
    'corporate',
    'approved',
    'accepted'
  );

  -- BM7 Update App (updating, rejected — for "various approval statuses")
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    v_app_bm7_update,
    'ibc-app-testa1203',
    NULL,
    'Information, Technology, Creativity and Media',
    v_logo_url || 'test-bm-history.jpg',
    'updating',
    'Heritage Builders Inc.',
    '789 Heritage Ave, Iloilo City',
    '033-555-0303',
    '+639473333333',
    'update@heritagebuilders.test',
    'BPI',
    'https://heritagebuilders.test',
    'corporate',
    'rejected',
    'accepted'
  );

  ---------------------------------------------------------------------------
  -- Insert Primary Applications for BM1-BM6
  ---------------------------------------------------------------------------

  -- App-BM1: Paid member, corporate, approved
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    v_app_bm1_id,
    'ibc-app-testbm01',
    NULL,
    'Information, Technology, Creativity and Media',
    v_logo_url || 'test-bm-paid.jpg',
    'newMember',
    'Acme Corporation',
    '1 Acme Tower, Iloilo Business Park, Mandurriao, Iloilo City',
    '033-111-0101',
    '+639111111111',
    'membership@acmecorp.test',
    'BPI',
    'https://acmecorp.test',
    'corporate',
    'approved',
    'accepted'
  );

  -- App-BM2: Cancelled member, corporate, approved
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    v_app_bm2_id,
    'ibc-app-testbm02',
    NULL,
    'Manufacturing',
    v_logo_url || 'test-bm-cancelled.jpg',
    'newMember',
    'Legacy Industries',
    '22 Legacy Road, Jaro, Iloilo City',
    '033-222-0202',
    '+639122222222',
    'contact@legacyindustries.test',
    'BPI',
    'https://legacyindustries.test',
    'corporate',
    'approved',
    'accepted'
  );

  -- App-BM3: Paid member, PERSONAL type, approved (for G9 personal → corporate)
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    v_app_bm3_id,
    'ibc-app-testbm03',
    NULL,
    'Information, Technology, Creativity and Media',
    v_logo_url || 'test-bm-personal.jpg',
    'newMember',
    'InnovateTech Solutions',
    '3 Innovation Lane, La Paz, Iloilo City',
    '033-333-0303',
    '+639133333333',
    'hello@innovatetech.test',
    'BPI',
    'https://innovatetech.test',
    'personal',
    'approved',
    'accepted'
  );

  -- App-BM4: Featured member, corporate, approved
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    v_app_bm4_id,
    'ibc-app-testbm04',
    NULL,
    'Manufacturing',
    v_logo_url || 'test-bm-featured.jpg',
    'newMember',
    'Global Ventures Inc.',
    '44 Global Plaza, Molo, Iloilo City',
    '033-444-0404',
    '+639144444444',
    'ventures@globalventures.test',
    'BPI',
    'https://globalventures.test',
    'corporate',
    'approved',
    'accepted'
  );

  -- App-BM5: Non-featured member, corporate, approved
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    v_app_bm5_id,
    'ibc-app-testbm05',
    NULL,
    'Management and Business Consulting',
    v_logo_url || 'test-bm-unfeatured.jpg',
    'newMember',
    'Local Goods Co.',
    '55 Local Street, Arevalo, Iloilo City',
    '033-555-0505',
    '+639155555555',
    'support@localgoods.test',
    'BPI',
    'https://localgoods.test',
    'corporate',
    'approved',
    'accepted'
  );

  -- App-BM6: Unpaid member, corporate, approved
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    v_app_bm6_id,
    'ibc-app-testbm06',
    NULL,
    'Management and Business Consulting',
    v_logo_url || 'test-bm-unpaid.jpg',
    'newMember',
    'Prime Services Ltd.',
    '66 Prime Road, City Proper, Iloilo City',
    '033-666-0606',
    '+639166666666',
    'hello@primeservices.test',
    'BPI',
    'https://primeservices.test',
    'corporate',
    'approved',
    'accepted'
  );

  ---------------------------------------------------------------------------
  -- Insert ApplicationMembers for all apps
  ---------------------------------------------------------------------------

  -- BM1 App Members
  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444401', v_app_bm1_id, 'Juan', 'Dela Cruz', 'juan.delacruz@acmecorp.test', '+639111111111', '033-111-0101', '1 Acme Tower, Iloilo Business Park, Mandurriao, Iloilo City', '1980-03-15', 'Male', 'Filipino', 'President & CEO', 'principal'),
    ('33333333-3333-4333-8333-444444444402', v_app_bm1_id, 'Sofia', 'Garcia', 'sofia.garcia@acmecorp.test', '+639111111112', '033-111-0102', '1 Acme Tower, Iloilo Business Park, Mandurriao, Iloilo City', '1985-07-22', 'Female', 'Filipino', 'Vice President', 'alternate');

  -- BM2 App Members
  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444403', v_app_bm2_id, 'Pedro', 'Reyes', 'pedro.reyes@legacyindustries.test', '+639122222221', '033-222-0202', '22 Legacy Road, Jaro, Iloilo City', '1975-11-08', 'Male', 'Filipino', 'Managing Partner', 'principal'),
    ('33333333-3333-4333-8333-444444444404', v_app_bm2_id, 'Elena', 'Torres', 'elena.torres@legacyindustries.test', '+639122222222', '033-222-0203', '22 Legacy Road, Jaro, Iloilo City', '1982-04-17', 'Female', 'Filipino', 'Operations Manager', 'alternate');

  -- BM3 App Members
  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444405', v_app_bm3_id, 'Angelo', 'Mendoza', 'angelo.mendoza@innovatetech.test', '+639133333331', '033-333-0303', '3 Innovation Lane, La Paz, Iloilo City', '1988-09-30', 'Male', 'Filipino', 'Founder', 'principal'),
    ('33333333-3333-4333-8333-444444444406', v_app_bm3_id, 'Beatrice', 'Lopez', 'beatrice.lopez@innovatetech.test', '+639133333332', '033-333-0304', '3 Innovation Lane, La Paz, Iloilo City', '1990-01-12', 'Female', 'Filipino', 'Co-Founder', 'alternate');

  -- BM4 App Members
  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444407', v_app_bm4_id, 'Robert', 'Chua', 'robert.chua@globalventures.test', '+639144444441', '033-444-0404', '44 Global Plaza, Molo, Iloilo City', '1978-06-25', 'Male', 'Filipino', 'CEO', 'principal'),
    ('33333333-3333-4333-8333-444444444408', v_app_bm4_id, 'Diana', 'Sy', 'diana.sy@globalventures.test', '+639144444442', '033-444-0405', '44 Global Plaza, Molo, Iloilo City', '1983-12-01', 'Female', 'Filipino', 'CFO', 'alternate');

  -- BM5 App Members
  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444409', v_app_bm5_id, 'Miguel', 'Aquino', 'miguel.aquino@localgoods.test', '+639155555551', '033-555-0505', '55 Local Street, Arevalo, Iloilo City', '1992-08-14', 'Male', 'Filipino', 'Owner', 'principal'),
    ('33333333-3333-4333-8333-444444444410', v_app_bm5_id, 'Catherine', 'Lim', 'catherine.lim@localgoods.test', '+639155555552', '033-555-0506', '55 Local Street, Arevalo, Iloilo City', '1995-02-20', 'Female', 'Filipino', 'Marketing Head', 'alternate');

  -- BM6 App Members
  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444411', v_app_bm6_id, 'Christopher', 'Gonzales', 'chris.gonzales@primeservices.test', '+639166666661', '033-666-0606', '66 Prime Road, City Proper, Iloilo City', '1987-10-05', 'Male', 'Filipino', 'General Manager', 'principal'),
    ('33333333-3333-4333-8333-444444444412', v_app_bm6_id, 'Patricia', 'Fernandez', 'patricia.fernandez@primeservices.test', '+639166666662', '033-666-0607', '66 Prime Road, City Proper, Iloilo City', '1991-05-18', 'Female', 'Filipino', 'Finance Director', 'alternate');

  -- BM7 App Members (for all 3 history apps)
  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444413', v_app_bm7_init, 'Rafael', 'Villanueva', 'rafael.villanueva@heritagebuilders.test', '+639471111101', '033-555-0101', '789 Heritage Ave, Iloilo City', '1970-04-10', 'Male', 'Filipino', 'Chairman', 'principal'),
    ('33333333-3333-4333-8333-444444444414', v_app_bm7_init, 'Teresa', 'Villanueva', 'teresa.villanueva@heritagebuilders.test', '+639471111102', '033-555-0102', '789 Heritage Ave, Iloilo City', '1972-09-30', 'Female', 'Filipino', 'President', 'alternate'),
    ('33333333-3333-4333-8333-444444444415', v_app_bm7_renewal, 'Rafael', 'Villanueva', 'rafael.villanueva@heritagebuilders.test', '+639472222201', '033-555-0202', '789 Heritage Ave, Iloilo City', '1970-04-10', 'Male', 'Filipino', 'Chairman', 'principal'),
    ('33333333-3333-4333-8333-444444444416', v_app_bm7_renewal, 'Teresa', 'Villanueva', 'teresa.villanueva@heritagebuilders.test', '+639472222202', '033-555-0203', '789 Heritage Ave, Iloilo City', '1972-09-30', 'Female', 'Filipino', 'President', 'alternate'),
    ('33333333-3333-4333-8333-444444444417', v_app_bm7_update, 'Rafael', 'Villanueva', 'rafael.villanueva@heritagebuilders.test', '+639473333301', '033-555-0303', '789 Heritage Ave, Iloilo City', '1970-04-10', 'Male', 'Filipino', 'Chairman', 'principal'),
    ('33333333-3333-4333-8333-444444444418', v_app_bm7_update, 'Teresa', 'Villanueva', 'teresa.villanueva@heritagebuilders.test', '+639473333302', '033-555-0304', '789 Heritage Ave, Iloilo City', '1972-09-30', 'Female', 'Filipino', 'President', 'alternate');

  ---------------------------------------------------------------------------
  -- Insert Business Members
  ---------------------------------------------------------------------------

  -- BM1: Paid, corporate
  INSERT INTO "public"."BusinessMember" ("businessMemberId", "sectorId", "logoImageURL", "joinDate", "websiteURL", "businessName", "lastPaymentDate", "membershipExpiryDate", "membershipStatus", "primaryApplicationId", "identifier")
  VALUES (
    v_bm1_id, 11, v_logo_url || 'test-bm-paid.jpg',
    CURRENT_DATE,
    'https://acmecorp.test',
    'Acme Corporation',
    NOW(),
    NOW() + INTERVAL '1 year',
    'paid',
    v_app_bm1_id,
    'ibc-mem-testg501'
  );

  -- Update BM1's application to link back to BM1
  UPDATE "public"."Application" SET "businessMemberId" = v_bm1_id WHERE "applicationId" = v_app_bm1_id;

  -- BM2: Cancelled, with known identifier for G8
  INSERT INTO "public"."BusinessMember" ("businessMemberId", "sectorId", "logoImageURL", "joinDate", "websiteURL", "businessName", "lastPaymentDate", "membershipExpiryDate", "membershipStatus", "primaryApplicationId", "identifier")
  VALUES (
    v_bm2_id, 14, v_logo_url || 'test-bm-cancelled.jpg',
    CURRENT_DATE - INTERVAL '2 years',
    'https://legacyindustries.test',
    'Legacy Industries',
    NOW() - INTERVAL '14 months',
    NOW() - INTERVAL '2 months',
    'cancelled',
    v_app_bm2_id,
    'ibc-mem-testg801'
  );

  UPDATE "public"."Application" SET "businessMemberId" = v_bm2_id WHERE "applicationId" = v_app_bm2_id;

  -- Override trigger-set values (trigger_set_membership_expiry sets status=paid)
  UPDATE "public"."BusinessMember"
  SET "membershipStatus" = 'cancelled',
      "membershipExpiryDate" = NOW() - INTERVAL '2 months'
  WHERE "businessMemberId" = v_bm2_id;

  -- BM3: Paid, PERSONAL type (for G9)
  INSERT INTO "public"."BusinessMember" ("businessMemberId", "sectorId", "logoImageURL", "joinDate", "websiteURL", "businessName", "lastPaymentDate", "membershipExpiryDate", "membershipStatus", "primaryApplicationId", "identifier")
  VALUES (
    v_bm3_id, 11, v_logo_url || 'test-bm-personal.jpg',
    CURRENT_DATE,
    'https://innovatetech.test',
    'InnovateTech Solutions',
    NOW(),
    NOW() + INTERVAL '1 year',
    'paid',
    v_app_bm3_id,
    'ibc-mem-testg901'
  );

  UPDATE "public"."Application" SET "businessMemberId" = v_bm3_id WHERE "applicationId" = v_app_bm3_id;

  -- BM4: Featured member (A10)
  INSERT INTO "public"."BusinessMember" ("businessMemberId", "sectorId", "logoImageURL", "joinDate", "websiteURL", "businessName", "lastPaymentDate", "membershipExpiryDate", "membershipStatus", "primaryApplicationId", "identifier", "featuredExpirationDate")
  VALUES (
    v_bm4_id, 14, v_logo_url || 'test-bm-featured.jpg',
    CURRENT_DATE - INTERVAL '6 months',
    'https://globalventures.test',
    'Global Ventures Inc.',
    NOW(),
    NOW() + INTERVAL '1 year',
    'paid',
    v_app_bm4_id,
    'ibc-mem-testa1001',
    CURRENT_DATE + INTERVAL '30 days'
  );

  UPDATE "public"."Application" SET "businessMemberId" = v_bm4_id WHERE "applicationId" = v_app_bm4_id;

  -- BM5: Non-featured member (A10)
  INSERT INTO "public"."BusinessMember" ("businessMemberId", "sectorId", "logoImageURL", "joinDate", "websiteURL", "businessName", "lastPaymentDate", "membershipExpiryDate", "membershipStatus", "primaryApplicationId", "identifier")
  VALUES (
    v_bm5_id, 13, v_logo_url || 'test-bm-unfeatured.jpg',
    CURRENT_DATE - INTERVAL '3 months',
    'https://localgoods.test',
    'Local Goods Co.',
    NOW(),
    NOW() + INTERVAL '1 year',
    'paid',
    v_app_bm5_id,
    'ibc-mem-testa1002'
  );

  UPDATE "public"."Application" SET "businessMemberId" = v_bm5_id WHERE "applicationId" = v_app_bm5_id;

  -- BM6: Unpaid member (A11)
  INSERT INTO "public"."BusinessMember" ("businessMemberId", "sectorId", "logoImageURL", "joinDate", "websiteURL", "businessName", "lastPaymentDate", "membershipExpiryDate", "membershipStatus", "primaryApplicationId", "identifier")
  VALUES (
    v_bm6_id, 13, v_logo_url || 'test-bm-unpaid.jpg',
    CURRENT_DATE - INTERVAL '1 year',
    'https://primeservices.test',
    'Prime Services Ltd.',
    NOW() - INTERVAL '14 months',
    NOW() - INTERVAL '2 months',
    'unpaid',
    v_app_bm6_id,
    'ibc-mem-testa1101'
  );

  UPDATE "public"."Application" SET "businessMemberId" = v_bm6_id WHERE "applicationId" = v_app_bm6_id;

  -- Override trigger-set values (trigger_set_membership_expiry sets status=paid)
  UPDATE "public"."BusinessMember"
  SET "membershipStatus" = 'unpaid',
      "membershipExpiryDate" = NOW() - INTERVAL '2 months'
  WHERE "businessMemberId" = v_bm6_id;

  -- BM7: Member with full application history (A12)
  INSERT INTO "public"."BusinessMember" ("businessMemberId", "sectorId", "logoImageURL", "joinDate", "websiteURL", "businessName", "lastPaymentDate", "membershipExpiryDate", "membershipStatus", "primaryApplicationId", "identifier")
  VALUES (
    v_bm7_id, 11, v_logo_url || 'test-bm-history.jpg',
    CURRENT_DATE - INTERVAL '3 years',
    'https://heritagebuilders.test',
    'Heritage Builders',
    NOW(),
    NOW() + INTERVAL '1 year',
    'paid',
    v_app_bm7_init,
    'ibc-mem-testa1200'
  );

  -- Link all BM7 apps back to BM7
  UPDATE "public"."Application" SET "businessMemberId" = v_bm7_id WHERE "applicationId" = v_app_bm7_init;
  UPDATE "public"."Application" SET "businessMemberId" = v_bm7_id WHERE "applicationId" = v_app_bm7_renewal;
  UPDATE "public"."Application" SET "businessMemberId" = v_bm7_id WHERE "applicationId" = v_app_bm7_update;

  RAISE NOTICE '✅ 7 Business Members + 9 Applications + 18 ApplicationMembers seeded';
END $$;

-- =============================================================================
-- SECTION: Standalone Applications (Scenarios A5, A6, A7)
-- =============================================================================
-- A5: 3 applications with status "new", varying payment methods
-- A6: 2 applications with status "pending", paymentProofStatus "accepted"
-- A7: 3 applications with type "updating", status "pending", linked to BM

DO $$
DECLARE
  v_logo_url text := 'http://127.0.0.1:54321/storage/v1/object/public/logoimage/';
  v_bm1_id uuid := '22222222-2222-4222-8222-222222222201';
  v_bm3_id uuid := '22222222-2222-4222-8222-222222222203';
  v_bm4_id uuid := '22222222-2222-4222-8222-222222222204';
BEGIN
  RAISE NOTICE '📋 Seeding Standalone Applications for A5, A6, A7...';

  ---------------------------------------------------------------------------
  -- A5: New applications with pending payment (A5 - Checking Upcoming memberships)
  ---------------------------------------------------------------------------

  -- A5a: BPI payment, pending proof
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    '33333333-3333-4333-8333-333333333310',
    'ibc-app-testa501',
    NULL,
    'Healthcare Services and Equipment',
    v_logo_url || 'test-app-logo-1.jpg',
    'newMember',
    'MedCare Plus Corp.',
    '101 Health Blvd, Mandurriao, Iloilo City',
    '033-777-0101',
    '+639201111111',
    'apply@medcareplus.test',
    'BPI',
    'https://medcareplus.test',
    'corporate',
    'new',
    'pending'
  );

  -- A5b: BPI payment, pending proof
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    '33333333-3333-4333-8333-333333333311',
    'ibc-app-testa502',
    NULL,
    'Financial and Insurance Services',
    v_logo_url || 'test-app-logo-2.jpg',
    'newMember',
    'WealthWise Financial Advisors',
    '202 Finance Tower, City Proper, Iloilo City',
    '033-888-0202',
    '+639202222222',
    'join@wealthwise.test',
    'BPI',
    'https://wealthwise.test',
    'corporate',
    'new',
    'pending'
  );

  -- A5c: ONSITE payment (no proof needed)
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    '33333333-3333-4333-8333-333333333312',
    'ibc-app-testa503',
    NULL,
    'Educational Service',
    v_logo_url || 'test-app-logo-2.jpg',
    'renewal',
    'BrightFuture Learning Center',
    '303 Education Ave, Jaro, Iloilo City',
    '033-999-0303',
    '+639203333333',
    'admin@brightfuture.test',
    'ONSITE',
    'https://brightfuture.test',
    'corporate',
    'new',
    'pending'
  );

  -- A5 ApplicationMembers
  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444419', '33333333-3333-4333-8333-333333333310', 'Alberto', 'Santos', 'alberto.santos@medcareplus.test', '+639201111101', '033-777-0101', '101 Health Blvd, Mandurriao, Iloilo City', '1982-02-28', 'Male', 'Filipino', 'Medical Director', 'principal'),
    ('33333333-3333-4333-8333-444444444420', '33333333-3333-4333-8333-333333333310', 'Grace', 'Uy', 'grace.uy@medcareplus.test', '+639201111102', '033-777-0102', '101 Health Blvd, Mandurriao, Iloilo City', '1986-11-05', 'Female', 'Filipino', 'Administrator', 'alternate'),
    ('33333333-3333-4333-8333-444444444421', '33333333-3333-4333-8333-333333333311', 'Francis', 'Ong', 'francis.ong@wealthwise.test', '+639202222201', '033-888-0202', '202 Finance Tower, City Proper, Iloilo City', '1979-07-12', 'Male', 'Filipino', 'Managing Partner', 'principal'),
    ('33333333-3333-4333-8333-444444444422', '33333333-3333-4333-8333-333333333311', 'Melissa', 'Tan', 'melissa.tan@wealthwise.test', '+639202222202', '033-888-0203', '202 Finance Tower, City Proper, Iloilo City', '1984-03-20', 'Female', 'Filipino', 'Senior Advisor', 'alternate'),
    ('33333333-3333-4333-8333-444444444423', '33333333-3333-4333-8333-333333333312', 'Nicole', 'Gomez', 'nicole.gomez@brightfuture.test', '+639203333301', '033-999-0303', '303 Education Ave, Jaro, Iloilo City', '1990-09-15', 'Female', 'Filipino', 'School Director', 'principal'),
    ('33333333-3333-4333-8333-444444444424', '33333333-3333-4333-8333-333333333312', 'Daniel', 'Ramos', 'daniel.ramos@brightfuture.test', '+639203333302', '033-999-0304', '303 Education Ave, Jaro, Iloilo City', '1988-06-01', 'Male', 'Filipino', 'Academic Coordinator', 'alternate');

  -- ProofImages for A5 BPI applications
  INSERT INTO "public"."ProofImage" ("proofImageId", "applicationId", "path")
  VALUES
    ('77777777-7777-4777-8777-777777777701', '33333333-3333-4333-8333-333333333310', 'app-test-a501'),
    ('77777777-7777-4777-8777-777777777702', '33333333-3333-4333-8333-333333333311', 'app-test-a502');

  ---------------------------------------------------------------------------
  -- A6: Pending applications with accepted payment proof (A6 - Accepting/Declining)
  ---------------------------------------------------------------------------

  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    '33333333-3333-4333-8333-333333333313',
    'ibc-app-testa601',
    NULL,
    'Real Estate Development and Construction',
    v_logo_url || 'test-app-logo-1.jpg',
    'newMember',
    'Prime Property Developers',
    '404 Realty Blvd, Molo, Iloilo City',
    '033-101-0404',
    '+639204444444',
    'developers@primeproperty.test',
    'BPI',
    'https://primeproperty.test',
    'corporate',
    'pending',
    'accepted'
  );

  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    '33333333-3333-4333-8333-333333333314',
    'ibc-app-testa602',
    NULL,
    'Shipping, Tourist Transport, Customs Brokerage, and Logistics',
    v_logo_url || 'test-app-logo-2.jpg',
    'newMember',
    'Island Logistics Corp.',
    '505 Logistics Way, La Paz, Iloilo City',
    '033-202-0505',
    '+639205555555',
    'info@islandlogistics.test',
    'BPI',
    'https://islandlogistics.test',
    'corporate',
    'pending',
    'accepted'
  );

  -- A6 ApplicationMembers
  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444425', '33333333-3333-4333-8333-333333333313', 'Victor', 'Lim', 'victor.lim@primeproperty.test', '+639204444401', '033-101-0404', '404 Realty Blvd, Molo, Iloilo City', '1976-12-12', 'Male', 'Filipino', 'CEO', 'principal'),
    ('33333333-3333-4333-8333-444444444426', '33333333-3333-4333-8333-333333333313', 'Andrea', 'Cruz', 'andrea.cruz@primeproperty.test', '+639204444402', '033-101-0405', '404 Realty Blvd, Molo, Iloilo City', '1981-08-08', 'Female', 'Filipino', 'COO', 'alternate'),
    ('33333333-3333-4333-8333-444444444427', '33333333-3333-4333-8333-333333333314', 'Ramon', 'Santiago', 'ramon.santiago@islandlogistics.test', '+639205555501', '033-202-0505', '505 Logistics Way, La Paz, Iloilo City', '1973-05-19', 'Male', 'Filipino', 'President', 'principal'),
    ('33333333-3333-4333-8333-444444444428', '33333333-3333-4333-8333-333333333314', 'Clara', 'Villanueva', 'clara.villanueva@islandlogistics.test', '+639205555502', '033-202-0506', '505 Logistics Way, La Paz, Iloilo City', '1977-10-30', 'Female', 'Filipino', 'VP Operations', 'alternate');

  -- ProofImages for A6 applications
  INSERT INTO "public"."ProofImage" ("proofImageId", "applicationId", "path")
  VALUES
    ('77777777-7777-4777-8777-777777777703', '33333333-3333-4333-8333-333333333313', 'app-test-a503'),
    ('77777777-7777-4777-8777-777777777704', '33333333-3333-4333-8333-333333333314', 'app-test-a503');

  ---------------------------------------------------------------------------
  -- A7: Update applications linked to existing BMs (A7 - Update Info Applications)
  ---------------------------------------------------------------------------

  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    '33333333-3333-4333-8333-333333333315',
    'ibc-app-testa701',
    v_bm1_id,
    'Information, Technology, Creativity and Media',
    v_logo_url || 'test-app-logo-1.jpg',
    'updating',
    'Acme Corporation',
    '1 Acme Tower, Iloilo Business Park (Updated Suite 2A), Mandurriao, Iloilo City',
    '033-111-0101',
    '+639111111111',
    'membership@acmecorp.test',
    'ONSITE',
    'https://acmecorp.test',
    'corporate',
    'pending',
    'pending'
  );

  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    '33333333-3333-4333-8333-333333333316',
    'ibc-app-testa702',
    v_bm4_id,
    'Manufacturing',
    v_logo_url || 'test-app-logo-2.jpg',
    'updating',
    'Global Ventures Inc.',
    '44 Global Plaza (Updated Wing B), Molo, Iloilo City',
    '033-444-0404',
    '+639144444444',
    'ventures@globalventures.test',
    'ONSITE',
    'https://globalventures.test',
    'corporate',
    'pending',
    'pending'
  );

  -- A7 ApplicationMembers (reuse same principal members but with updated details)
  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444429', '33333333-3333-4333-8333-333333333315', 'Juan', 'Dela Cruz', 'juan.delacruz@acmecorp.test', '+639111111111', '033-111-0101', '1 Acme Tower, Iloilo Business Park (Updated Suite 2A), Mandurriao, Iloilo City', '1980-03-15', 'Male', 'Filipino', 'President & CEO', 'principal'),
    ('33333333-3333-4333-8333-444444444430', '33333333-3333-4333-8333-333333333316', 'Robert', 'Chua', 'robert.chua@globalventures.test', '+639144444441', '033-444-0404', '44 Global Plaza (Updated Wing B), Molo, Iloilo City', '1978-06-25', 'Male', 'Filipino', 'CEO', 'principal');

  ---------------------------------------------------------------------------
  -- A7c: Update application — personal → corporate (for G9)
  ---------------------------------------------------------------------------
  INSERT INTO "public"."Application" ("applicationId", "identifier", "businessMemberId", "sectorName", "logoImageURL", "applicationType", "companyName", "companyAddress", "landline", "mobileNumber", "emailAddress", "paymentMethod", "websiteURL", "applicationMemberType", "applicationStatus", "paymentProofStatus")
  VALUES (
    '33333333-3333-4333-8333-333333333317',
    'ibc-app-testa703',
    v_bm3_id,
    'Information, Technology, Creativity and Media',
    v_logo_url || 'test-app-logo-1.jpg',
    'updating',
    'InnovateTech Solutions Inc.',
    '3 Innovation Lane, La Paz, Iloilo City',
    '033-333-0303',
    '+639133333333',
    'hello@innovatetech.test',
    'ONSITE',
    'https://innovatetech.test',
    'corporate',
    'pending',
    'pending'
  );

  INSERT INTO "public"."ApplicationMember" ("applicationMemberId", "applicationId", "firstName", "lastName", "emailAddress", "mobileNumber", "landline", "mailingAddress", "birthdate", "sex", "nationality", "companyDesignation", "companyMemberType")
  VALUES
    ('33333333-3333-4333-8333-444444444431', '33333333-3333-4333-8333-333333333317', 'Angelo', 'Mendoza', 'angelo.mendoza@innovatetech.test', '+639133333331', '033-333-0303', '3 Innovation Lane, La Paz, Iloilo City', '1988-09-30', 'Male', 'Filipino', 'Founder & CEO', 'principal');

  -- Interview for A6 (linked to one pending application)
  INSERT INTO "public"."Interview" ("interviewId", "interviewDate", "interviewVenue", "status", "notes", "applicationId")
  VALUES (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    TIMEZONE('UTC', NOW()) + INTERVAL '5 days',
    'IBC Office, Marymart Iloilo',
    'scheduled',
    'Initial screening interview for new membership application.',
    '33333333-3333-4333-8333-333333333313'
  );

  RAISE NOTICE '✅ 7 standalone applications + 12 application members + 4 proof images + 1 interview seeded';
END $$;

-- =============================================================================
-- SECTION: Registrations, Participants, ProofImages (Scenarios A1-A4)
-- =============================================================================
-- A1: 3+ registrations with pending payment proof (BPI)
-- A2-A4: 5+ registrations in various checkout states for the check-in desk

DO $$
DECLARE
  v_event1_id uuid := '11111111-1111-4111-8111-111111111101';
  v_bm1_id uuid := '22222222-2222-4222-8222-222222222201';

  v_event1_day1_id uuid;
  v_event1_day2_id uuid;

  v_reg_a101_id uuid := '44444444-4444-4444-8444-444444444401';
  v_reg_a102_id uuid := '44444444-4444-4444-8444-444444444402';
  v_reg_a103_id uuid := '44444444-4444-4444-8444-444444444403';
  v_reg_a201_id uuid := '44444444-4444-4444-8444-444444444404';
  v_reg_a202_id uuid := '44444444-4444-4444-8444-444444444405';
  v_reg_a203_id uuid := '44444444-4444-4444-8444-444444444406';
  v_reg_a204_id uuid := '44444444-4444-4444-8444-444444444407';
  v_reg_a205_id uuid := '44444444-4444-4444-8444-444444444408';
BEGIN
  RAISE NOTICE '🎫 Seeding Registrations for A1-A4...';

  -- Capture auto-created EventDay IDs for Event 1
  SELECT "eventDayId" INTO v_event1_day1_id
  FROM "public"."EventDay"
  WHERE "eventId" = v_event1_id
  ORDER BY "eventDate" ASC
  LIMIT 1;

  SELECT "eventDayId" INTO v_event1_day2_id
  FROM "public"."EventDay"
  WHERE "eventId" = v_event1_id
  ORDER BY "eventDate" ASC
  OFFSET 1
  LIMIT 1;

  ---------------------------------------------------------------------------
  -- A1: 3 registrations with BPI + pending payment proof
  ---------------------------------------------------------------------------

  -- Registration A1-1: BPI, pending, with proof image
  INSERT INTO "public"."Registration" ("registrationId", "eventId", "businessMemberId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus", "note")
  VALUES (
    v_reg_a101_id, v_event1_id, NULL, 'DTI Iloilo Regional Office',
    TIMEZONE('UTC', NOW()) - INTERVAL '2 days',
    'BPI', 'ibc-reg-testa101', 'pending', 'Attending Day 1 only'
  );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555501', v_reg_a101_id, 'Felipe', 'Dizon', '+639401111101', 'felipe.dizon@dti.gov.ph', true);

  INSERT INTO "public"."ProofImage" ("proofImageId", "registrationId", "path")
  VALUES ('77777777-7777-4777-8777-777777777711', v_reg_a101_id, 'reg-test-a101');

  -- Registration A1-2: BPI, pending, with proof image
  INSERT INTO "public"."Registration" ("registrationId", "eventId", "businessMemberId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus")
  VALUES (
    v_reg_a102_id, v_event1_id, NULL, 'CHED Region VI',
    TIMEZONE('UTC', NOW()) - INTERVAL '1 day',
    'BPI', 'ibc-reg-testa102', 'pending'
  );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555503', v_reg_a102_id, 'Marites', 'Sarmiento', '+639402222201', 'marites.sarmiento@ched.gov.ph', true);

  INSERT INTO "public"."ProofImage" ("proofImageId", "registrationId", "path")
  VALUES ('77777777-7777-4777-8777-777777777712', v_reg_a102_id, 'reg-test-a102');

  -- Registration A1-3: BPI, pending, with proof image
  INSERT INTO "public"."Registration" ("registrationId", "eventId", "businessMemberId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus")
  VALUES (
    v_reg_a103_id, v_event1_id, NULL, 'Iloilo Provincial Government',
    TIMEZONE('UTC', NOW()) - INTERVAL '12 hours',
    'BPI', 'ibc-reg-testa103', 'pending'
  );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555504', v_reg_a103_id, 'Gov. Arthur', 'Defensor', '+639403333301', 'gov.defensor@iloilo.gov.ph', true);

  INSERT INTO "public"."ProofImage" ("proofImageId", "registrationId", "path")
  VALUES ('77777777-7777-4777-8777-777777777713', v_reg_a103_id, 'reg-test-a103');

  ---------------------------------------------------------------------------
  -- A2-A4: Check-in desk registrations (various states)
  ---------------------------------------------------------------------------

  -- Registration A2-1: Standard attendee (accepted, member, no check-in yet)
  INSERT INTO "public"."Registration" ("registrationId", "eventId", "businessMemberId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus", "note")
  VALUES (
    v_reg_a201_id, v_event1_id, v_bm1_id, NULL,
    TIMEZONE('UTC', NOW()) - INTERVAL '5 days',
    'ONSITE', 'ibc-reg-testa201', 'accepted', 'Attending both days'
  );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555506', v_reg_a201_id, 'Juan', 'Dela Cruz', '+639111111111', 'juan.delacruz@acmecorp.test', true);

  -- Registration A2-2: Proxy scenario (accepted, member, with proxy note)
  INSERT INTO "public"."Registration" ("registrationId", "eventId", "businessMemberId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus", "note")
  VALUES (
    v_reg_a202_id, v_event1_id, v_bm1_id, NULL,
    TIMEZONE('UTC', NOW()) - INTERVAL '4 days',
    'ONSITE', 'ibc-reg-testa202', 'accepted', 'Attending Day 1 only; will be represented by a proxy'
  );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555507', v_reg_a202_id, 'Sofia', 'Garcia', '+639111111112', 'sofia.garcia@acmecorp.test', true);

  -- Registration A2-3: Rejected-then-new-proof (was rejected, now has new proof)
  INSERT INTO "public"."Registration" ("registrationId", "eventId", "businessMemberId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus", "note")
  VALUES (
    v_reg_a203_id, v_event1_id, NULL, 'Independent Consultant',
    TIMEZONE('UTC', NOW()) - INTERVAL '3 days',
    'BPI', 'ibc-reg-testa203', 'accepted', 'Previously rejected — brought new proof on the day'
  );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555508', v_reg_a203_id, 'Tomas', 'Bautista', '+639504444401', 'tomas.bautista@email.test', true);

  INSERT INTO "public"."ProofImage" ("proofImageId", "registrationId", "path")
  VALUES ('77777777-7777-4777-8777-777777777714', v_reg_a203_id, 'reg-test-a101');

  -- Registration A2-4: Forgot QR code (accepted, member)
  INSERT INTO "public"."Registration" ("registrationId", "eventId", "businessMemberId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus")
  VALUES (
    v_reg_a204_id, v_event1_id, NULL, 'Freelance Designer',
    TIMEZONE('UTC', NOW()) - INTERVAL '2 days',
    'ONSITE', 'ibc-reg-testa204', 'accepted'
  );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555509', v_reg_a204_id, 'Nina', 'Reyes', '+639505555501', 'nina.reyes@email.test', true);

  -- Registration A2-5: Unhandled payment proof (pending)
  INSERT INTO "public"."Registration" ("registrationId", "eventId", "businessMemberId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus")
  VALUES (
    v_reg_a205_id, v_event1_id, NULL, 'Startup Founder',
    TIMEZONE('UTC', NOW()) - INTERVAL '1 day',
    'ONSITE', 'ibc-reg-testa205', 'pending'
  );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555510', v_reg_a205_id, 'Xavier', 'Castro', '+639506666601', 'xavier.castro@email.test', true);

  ---------------------------------------------------------------------------
  -- Multi-participant registration (group registration - testing 4 pax)
  ---------------------------------------------------------------------------

  INSERT INTO "public"."Registration" ("registrationId", "eventId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus", "note")
  VALUES (
    '44444444-4444-4444-8444-444444444418', v_event1_id, 'Fernandez Family Group',
    TIMEZONE('UTC', NOW()) - INTERVAL '2 days',
    'ONSITE', 'ibc-reg-testgrp', 'accepted', 'Family group registration - 4 participants'
  );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555519', '44444444-4444-4444-8444-444444444418', 'Ramon', 'Fernandez', '+639701234509', 'ramon.fernandez@email.test', true),
    ('55555555-5555-4555-8555-555555555520', '44444444-4444-4444-8444-444444444418', 'Luz', 'Fernandez', '+639701234510', 'luz.fernandez@email.test', false),
    ('55555555-5555-4555-8555-555555555521', '44444444-4444-4444-8444-444444444418', 'Carlos', 'Fernandez', '+639701234511', 'carlos.fernandez@email.test', false),
    ('55555555-5555-4555-8555-555555555522', '44444444-4444-4444-8444-444444444418', 'Ana', 'Fernandez', '+639701234512', 'ana.fernandez@email.test', false);

  ---------------------------------------------------------------------------
  -- A3: Pre-seeded check-in records for Day 1 (Attendance Management)
  -- Some with remarks, some without
  ---------------------------------------------------------------------------

  IF v_event1_day1_id IS NOT NULL THEN
    INSERT INTO "public"."CheckIn" ("checkInId", "participantId", "eventDayId", "remarks", "checkInTime")
    VALUES
      ('66666666-6666-4666-8666-666666666601', '55555555-5555-4555-8555-555555555506', v_event1_day1_id, NULL, TIMEZONE('UTC', NOW()) - INTERVAL '1 hour'),
      ('66666666-6666-4666-8666-666666666602', '55555555-5555-4555-8555-555555555507', v_event1_day1_id, 'Late arrival — joined at 10:30 AM', TIMEZONE('UTC', NOW()) - INTERVAL '1 hour' + INTERVAL '30 minutes'),
      ('66666666-6666-4666-8666-666666666603', '55555555-5555-4555-8555-555555555508', v_event1_day1_id, 'Proxy check-in by: Assistant', TIMEZONE('UTC', NOW()) - INTERVAL '45 minutes');
  END IF;

  RAISE NOTICE '✅ 8 registrations + 10 participants + 4 proof images + 3 check-ins seeded';
END $$;

-- =============================================================================
-- SECTION: Evaluations (Scenarios G11, A19, A20, A21)
-- =============================================================================
-- G11: Evaluate an event (needs past event)
-- A19: View evaluations
-- A20: View full event evaluations for a specific event
-- A21: Bulk select & delete evaluations

DO $$
DECLARE
  v_event5_id uuid := '11111111-1111-4111-8111-111111111105';
  v_event6_id uuid := '11111111-1111-4111-8111-111111111106';
BEGIN
  RAISE NOTICE '📊 Seeding Evaluations for G11, A19-A21...';

  -- Evaluations for Event 5 (Agri-Business Forum)
  INSERT INTO "public"."EvaluationForm" ("evaluationId", "eventId", "name", "q1Rating", "q2Rating", "q3Rating", "q4Rating", "q5Rating", "q6Rating", "additionalComments", "createdAt")
  VALUES
    (
      '88888888-8888-4888-8888-888888888801',
      v_event5_id, 'Paolo Mendoza',
      'veryGood', 'excellent', 'good', 'veryGood', 'excellent', 'good',
      'The agri-business forum was very informative. I learned a lot about sustainable farming practices.',
      TIMEZONE('UTC', NOW()) - INTERVAL '7 days'
    ),
    (
      '88888888-8888-4888-8888-888888888802',
      v_event5_id, 'Luzviminda Santos',
      'good', 'good', 'fair', 'good', 'veryGood', 'good',
      'Well organized event. Would have preferred more hands-on workshops.',
      TIMEZONE('UTC', NOW()) - INTERVAL '6 days'
    ),
    (
      '88888888-8888-4888-8888-888888888803',
      v_event5_id, 'Ricardo Gomez',
      'excellent', 'veryGood', 'excellent', 'excellent', 'excellent', 'veryGood',
      'Excellent speakers and networking opportunities. Looking forward to the next one!',
      TIMEZONE('UTC', NOW()) - INTERVAL '5 days'
    );

  -- Evaluations for Event 6 (Networking Night)
  INSERT INTO "public"."EvaluationForm" ("evaluationId", "eventId", "name", "q1Rating", "q2Rating", "q3Rating", "q4Rating", "q5Rating", "q6Rating", "additionalComments", "createdAt")
  VALUES
    (
      '88888888-8888-4888-8888-888888888804',
      v_event6_id, 'Sandra Chua',
      'veryGood', 'excellent', 'veryGood', 'good', 'veryGood', 'excellent',
      'Great networking event! Met several potential business partners. The speed networking format was effective.',
      TIMEZONE('UTC', NOW()) - INTERVAL '14 days'
    ),
    (
      '88888888-8888-4888-8888-888888888805',
      v_event6_id, 'Benigno Aquino III',
      'good', 'fair', 'good', 'fair', 'good', 'fair',
      'Decent event but the venue was a bit crowded. Food was excellent though.',
      TIMEZONE('UTC', NOW()) - INTERVAL '13 days'
    ),
    (
      '88888888-8888-4888-8888-888888888806',
      v_event6_id, 'Catherine Ong',
      'fair', 'poor', 'fair', 'good', 'fair', 'fair',
      'The event started late and there was some confusion with the seating arrangement.',
      TIMEZONE('UTC', NOW()) - INTERVAL '12 days'
    );

  RAISE NOTICE '✅ 6 evaluations seeded (3 for each past event)';
END $$;

-- =============================================================================
-- SECTION: Sponsored Registrations (Scenarios A22-A28, G12-G14)
-- =============================================================================
-- SR1: Active, unused (usedCount=0) — A22, A25, A26, A28, G12
-- SR2: Disabled — A22, A25, G13
-- SR3: Used (usedCount>0) — A22, A24, A27
-- SR4: Past event — A22, G14

DO $$
DECLARE
  v_event1_id uuid := '11111111-1111-4111-8111-111111111101';
  v_event2_id uuid := '11111111-1111-4111-8111-111111111102';
  v_event6_id uuid := '11111111-1111-4111-8111-111111111106';

  v_sr1_id uuid := '99999999-9999-4999-8999-999999999901';
  v_sr2_id uuid := '99999999-9999-4999-8999-999999999902';
  v_sr3_id uuid := '99999999-9999-4999-8999-999999999903';
  v_sr4_id uuid := '99999999-9999-4999-8999-999999999904';
BEGIN
  RAISE NOTICE '🎟️ Seeding Sponsored Registrations for A22-A28, G12-G14...';

  -- SR1: Active, unused — for G12 (guest opens active sponsored link)
  INSERT INTO "public"."SponsoredRegistration" ("sponsoredRegistrationId", "uuid", "eventId", "sponsoredBy", "feeDeduction", "maxSponsoredGuests", "usedCount", "status")
  VALUES (
    v_sr1_id,
    gen_random_uuid()::text,
    v_event1_id,
    'CPU College of Business and Accountancy',
    500.00,
    10,
    0,
    'active'
  );

  -- SR2: Disabled — for G13 (guest opens disabled sponsored link)
  INSERT INTO "public"."SponsoredRegistration" ("sponsoredRegistrationId", "uuid", "eventId", "sponsoredBy", "feeDeduction", "maxSponsoredGuests", "usedCount", "status")
  VALUES (
    v_sr2_id,
    gen_random_uuid()::text,
    v_event2_id,
    'Iloilo City Government — Youth Affairs Office',
    300.00,
    25,
    0,
    'disabled'
  );

  -- SR3: Used — for A24 (view details with registered guests), A27 (delete blocked)
  INSERT INTO "public"."SponsoredRegistration" ("sponsoredRegistrationId", "uuid", "eventId", "sponsoredBy", "feeDeduction", "maxSponsoredGuests", "usedCount", "status")
  VALUES (
    v_sr3_id,
    gen_random_uuid()::text,
    v_event1_id,
    'Western Institute of Technology',
    750.00,
    15,
    3,
    'active'
  );

  -- Create registrations that consumed SR3 slots (usedCount = 3)
  INSERT INTO "public"."Registration" ("registrationId", "eventId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus", "sponsoredRegistrationId")
  VALUES
    (
      '44444444-4444-4444-8444-444444444410',
      v_event1_id, 'WIT Student — Computer Science',
      TIMEZONE('UTC', NOW()) - INTERVAL '1 day',
      'ONSITE', 'ibc-reg-tests301', 'accepted', v_sr3_id
    ),
    (
      '44444444-4444-4444-8444-444444444411',
      v_event1_id, 'WIT Student — Information Technology',
      TIMEZONE('UTC', NOW()) - INTERVAL '1 day',
      'ONSITE', 'ibc-reg-tests302', 'accepted', v_sr3_id
    ),
    (
      '44444444-4444-4444-8444-444444444412',
      v_event1_id, 'WIT Student — Electrical Engineering',
      TIMEZONE('UTC', NOW()) - INTERVAL '1 day',
      'ONSITE', 'ibc-reg-tests303', 'accepted', v_sr3_id
    );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555511', '44444444-4444-4444-8444-444444444410', 'Jose', 'Pascual', '+639701234501', 'jose.pascual@wit.test', true),
    ('55555555-5555-4555-8555-555555555512', '44444444-4444-4444-8444-444444444411', 'Karen', 'Delos Santos', '+639701234502', 'karen.delossantos@wit.test', true),
    ('55555555-5555-4555-8555-555555555513', '44444444-4444-4444-8444-444444444412', 'Mark', 'Valdez', '+639701234503', 'mark.valdez@wit.test', true);

  -- SR4: Past event — for G14 (guest opens sponsored link for finished event)
  INSERT INTO "public"."SponsoredRegistration" ("sponsoredRegistrationId", "uuid", "eventId", "sponsoredBy", "feeDeduction", "maxSponsoredGuests", "usedCount", "status")
  VALUES (
    v_sr4_id,
    gen_random_uuid()::text,
    v_event6_id,
    'University of San Agustin — Business Department',
    400.00,
    20,
    0,
    'active'
  );

  RAISE NOTICE '✅ 4 sponsored registrations + 3 linked event registrations seeded';
END $$;

-- =============================================================================
-- SECTION: A22-Extra — Maxed-out sponsored registration (fully booked)
-- =============================================================================
-- A fully booked sponsored registration where all slots are taken.
-- This tests the admin view when a sponsor's capacity is reached.

DO $$
DECLARE
  v_event2_id uuid := '11111111-1111-4111-8111-111111111102';

  v_sr5_id uuid := '99999999-9999-4999-8999-999999999905';
  v_reg_max1_id uuid := '44444444-4444-4444-8444-444444444413';
  v_reg_max2_id uuid := '44444444-4444-4444-8444-444444444414';
  v_reg_max3_id uuid := '44444444-4444-4444-8444-444444444415';
  v_reg_max4_id uuid := '44444444-4444-4444-8444-444444444416';
  v_reg_max5_id uuid := '44444444-4444-4444-8444-444444444417';
BEGIN
  RAISE NOTICE '🎟️ Seeding maxed-out sponsored registration (fully booked)...';

  INSERT INTO "public"."SponsoredRegistration" ("sponsoredRegistrationId", "uuid", "eventId", "sponsoredBy", "feeDeduction", "maxSponsoredGuests", "usedCount", "status")
  VALUES (
    v_sr5_id,
    gen_random_uuid()::text,
    v_event2_id,
    'Iloilo City Chamber of Commerce and Industry Foundation',
    600.00,
    5,
    5,
    'active'
  );

  INSERT INTO "public"."Registration" ("registrationId", "eventId", "nonMemberName", "registrationDate", "paymentMethod", "identifier", "paymentProofStatus", "sponsoredRegistrationId")
  VALUES
    (
      v_reg_max1_id,
      v_event2_id, 'Andrea Villanueva',
      TIMEZONE('UTC', NOW()) - INTERVAL '2 days',
      'ONSITE', 'ibc-reg-testmax0', 'accepted', v_sr5_id
    ),
    (
      v_reg_max2_id,
      v_event2_id, 'Benigno Santos',
      TIMEZONE('UTC', NOW()) - INTERVAL '2 days',
      'ONSITE', 'ibc-reg-testmax1', 'accepted', v_sr5_id
    ),
    (
      v_reg_max3_id,
      v_event2_id, 'Catalina Reyes',
      TIMEZONE('UTC', NOW()) - INTERVAL '2 days',
      'ONSITE', 'ibc-reg-testmax2', 'accepted', v_sr5_id
    ),
    (
      v_reg_max4_id,
      v_event2_id, 'Diego Fernandez',
      TIMEZONE('UTC', NOW()) - INTERVAL '2 days',
      'ONSITE', 'ibc-reg-testmax3', 'accepted', v_sr5_id
    ),
    (
      v_reg_max5_id,
      v_event2_id, 'Elena Mendoza',
      TIMEZONE('UTC', NOW()) - INTERVAL '2 days',
      'ONSITE', 'ibc-reg-testmax4', 'accepted', v_sr5_id
    );

  INSERT INTO "public"."Participant" ("participantId", "registrationId", "firstName", "lastName", "contactNumber", "email", "isPrincipal")
  VALUES
    ('55555555-5555-4555-8555-555555555514', v_reg_max1_id, 'Andrea', 'Villanueva', '+639701234504', 'andrea.villanueva@email.test', true),
    ('55555555-5555-4555-8555-555555555515', v_reg_max2_id, 'Benigno', 'Santos', '+639701234505', 'benigno.santos@email.test', true),
    ('55555555-5555-4555-8555-555555555516', v_reg_max3_id, 'Catalina', 'Reyes', '+639701234506', 'catalina.reyes@email.test', true),
    ('55555555-5555-4555-8555-555555555517', v_reg_max4_id, 'Diego', 'Fernandez', '+639701234507', 'diego.fernandez@email.test', true),
    ('55555555-5555-4555-8555-555555555518', v_reg_max5_id, 'Elena', 'Mendoza', '+639701234508', 'elena.mendoza@email.test', true);

  RAISE NOTICE '✅ Maxed-out sponsored registration seeded (5/5 slots filled)';
END $$;

-- =============================================================================
-- SECTION: A18 — Sector with members (for delete sector test)
-- =============================================================================
-- Add an extra sector with test members assigned, so an admin can delete it
-- and move members to another sector.

DO $$
DECLARE
  v_sector_id bigint;
BEGIN
  RAISE NOTICE '🏢 Seeding extra sector for A18...';

  INSERT INTO "public"."Sector" ("sectorName")
  VALUES ('Telecommunications')
  RETURNING "sectorId" INTO v_sector_id;

  RAISE NOTICE '✅ Extra sector "Telecommunications" created for A18 delete test';
END $$;

-- =============================================================================
-- VERIFY: Confirm seed counts
-- =============================================================================
DO $$
DECLARE
  v_se_count int;
  v_nw_count int;
  v_ev_count int;
  v_ed_count int;
  v_bm_count int;
  v_ap_count int;
  v_am_count int;
  v_rg_count int;
  v_pt_count int;
  v_ck_count int;
  v_pi_count int;
  v_ef_count int;
  v_sr_count int;
  v_iv_count int;
BEGIN
  SELECT COUNT(*) INTO v_se_count FROM "public"."Sector";
  SELECT COUNT(*) INTO v_nw_count FROM "public"."Networks";
  SELECT COUNT(*) INTO v_ev_count FROM "public"."Event";
  SELECT COUNT(*) INTO v_ed_count FROM "public"."EventDay";
  SELECT COUNT(*) INTO v_bm_count FROM "public"."BusinessMember";
  SELECT COUNT(*) INTO v_ap_count FROM "public"."Application";
  SELECT COUNT(*) INTO v_am_count FROM "public"."ApplicationMember";
  SELECT COUNT(*) INTO v_rg_count FROM "public"."Registration";
  SELECT COUNT(*) INTO v_pt_count FROM "public"."Participant";
  SELECT COUNT(*) INTO v_ck_count FROM "public"."CheckIn";
  SELECT COUNT(*) INTO v_pi_count FROM "public"."ProofImage";
  SELECT COUNT(*) INTO v_ef_count FROM "public"."EvaluationForm";
  SELECT COUNT(*) INTO v_sr_count FROM "public"."SponsoredRegistration";
  SELECT COUNT(*) INTO v_iv_count FROM "public"."Interview";

  RAISE NOTICE '';
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  USABILITY TEST SEED COMPLETE';
  RAISE NOTICE '══════════════════════════════════════════';
  RAISE NOTICE '  Sectors:                 %', v_se_count;
  RAISE NOTICE '  Networks:                % (G3)', v_nw_count;
  RAISE NOTICE '  Events:                  % (G1, G4, G5, G11, G14, A15)', v_ev_count;
  RAISE NOTICE '  EventDays:               % (auto-created)', v_ed_count;
  RAISE NOTICE '  BusinessMembers:         % (G5, G6, G8, G9, A9-A12)', v_bm_count;
  RAISE NOTICE '  Applications:            % (A5, A6, A7, A12)', v_ap_count;
  RAISE NOTICE '  ApplicationMembers:      %', v_am_count;
  RAISE NOTICE '  Registrations:           % (A1-A4, A24)', v_rg_count;
  RAISE NOTICE '  Participants:            %', v_pt_count;
  RAISE NOTICE '  CheckIns:                % (A3)', v_ck_count;
  RAISE NOTICE '  ProofImages:              % (A1, A5, A6)', v_pi_count;
  RAISE NOTICE '  Evaluations:             % (G11, A19-A21)', v_ef_count;
  RAISE NOTICE '  SponsoredRegistrations:  % (A22-A28, G12-G14)', v_sr_count;
  RAISE NOTICE '  Interviews:              %', v_iv_count;
  RAISE NOTICE '══════════════════════════════════════════';
END $$;
