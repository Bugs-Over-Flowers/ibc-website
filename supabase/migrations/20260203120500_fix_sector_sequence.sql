-- Fix sequence out of sync for Sector table
SELECT setval(pg_get_serial_sequence('"public"."Sector"', 'sectorId'), COALESCE((SELECT MAX("sectorId") FROM "public"."Sector"), 0) + 1, false);
