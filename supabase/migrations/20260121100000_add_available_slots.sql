-- Add availableSlots column to Event table
ALTER TABLE "public"."Event" ADD COLUMN IF NOT EXISTS "availableSlots" integer DEFAULT 0;

-- Update availableSlots to match maxGuest for existing records
UPDATE "public"."Event" SET "availableSlots" = "maxGuest";
