set check_function_bodies = off;

ALTER TYPE "public"."PaymentProofStatus" RENAME TO "PaymentStatus";

ALTER TABLE "public"."Registration" RENAME COLUMN "paymentProofStatus" TO "paymentStatus";

ALTER TABLE "public"."Application" RENAME COLUMN "paymentProofStatus" TO "paymentStatus";
