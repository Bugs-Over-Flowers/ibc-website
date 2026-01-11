import { describe, expect, it } from "vitest";
import { z } from "zod";
import { phoneSchema } from "@/lib/validation/utils";

// Create a simple email schema for testing
const emailSchema = z.string().email();

/**
 * Unit tests for validation schemas
 */
describe("lib/validation/utils", () => {
  describe("phoneSchema", () => {
    it("should accept valid Philippine phone numbers", () => {
      const validNumbers = [
        "+639171234567",
        "+639281234567",
        "09171234567",
        "9171234567",
      ];

      for (const number of validNumbers) {
        const result = phoneSchema.safeParse(number);
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid phone numbers", () => {
      const invalidNumbers = [
        "+1234567890", // Wrong country code
        "+6391712", // Too short
        "invalid", // Not a number
        "", // Empty string
        "12345", // Random numbers
      ];

      for (const number of invalidNumbers) {
        const result = phoneSchema.safeParse(number);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("emailSchema", () => {
    it("should accept valid email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
      ];

      for (const email of validEmails) {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user @example.com", // Space in email
        "", // Empty string
      ];

      for (const email of invalidEmails) {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      }
    });
  });
});
