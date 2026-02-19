DO $$
BEGIN
  CREATE TYPE "public"."PaymentProofStatus" AS ENUM (
    'pending',
    'accepted',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "public"."Application"
  ADD COLUMN IF NOT EXISTS "paymentProofStatus"
  "public"."PaymentProofStatus"
  DEFAULT 'pending'::"public"."PaymentProofStatus"
  NOT NULL;

UPDATE "public"."Application"
SET "paymentProofStatus" = 'accepted'::"public"."PaymentProofStatus"
WHERE "paymentStatus" = 'verified'::"public"."PaymentStatus";
