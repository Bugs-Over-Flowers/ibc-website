set check_function_bodies = off;

ALTER TYPE "public"."PaymentProofStatus" RENAME TO "PaymentStatus";

ALTER TABLE "public"."Registration" RENAME COLUMN "paymentProofStatus" TO "paymentStatus";

ALTER TABLE "public"."Application" RENAME COLUMN "paymentProofStatus" TO "paymentStatus";

ALTER TABLE "public"."Registration"
  ALTER COLUMN "paymentStatus" SET DEFAULT 'pending'::"public"."PaymentStatus";

ALTER TABLE "public"."Application"
  ALTER COLUMN "paymentStatus" SET DEFAULT 'pending'::"public"."PaymentStatus";
