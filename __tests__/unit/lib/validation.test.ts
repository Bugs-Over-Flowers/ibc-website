import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  GetCheckInForDateSchema,
  normalizeCheckInForEventDay,
} from "@/lib/validation/qr/standard";
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

  describe("GetCheckInForDateSchema normalization", () => {
    const baseRawCheckInData = {
      businessMember: { businessName: "IBC Org" },
      event: { eventId: "event-1" },
      identifier: "ibc-reg-abc12345",
      nonMemberName: null,
      participants: [
        {
          checkIn: [],
          contactNumber: "09171234567",
          email: "john@example.com",
          firstName: "John",
          isPrincipal: true,
          lastName: "Doe",
          participantId: "participant-1",
        },
      ],
      paymentMethod: "BPI",
      paymentStatus: "accepted",
      registrationDate: "2026-01-01T10:00:00+08:00",
      registrationId: "registration-1",
    };

    it("should keep only check-ins for the selected event day", () => {
      const normalized = normalizeCheckInForEventDay(
        {
          ...baseRawCheckInData,
          participants: [
            {
              ...baseRawCheckInData.participants[0],
              checkIn: [
                {
                  checkInId: "checkin-1",
                  checkInTime: "2026-01-01T11:00:00+08:00",
                  eventDayId: "day-1",
                  remarks: null,
                },
                {
                  checkInId: "checkin-2",
                  checkInTime: "2026-01-02T11:00:00+08:00",
                  eventDayId: "day-2",
                  remarks: "Late",
                },
              ],
            },
          ],
        },
        "day-1",
      );

      const parsed = GetCheckInForDateSchema.parse(normalized);
      expect(parsed.participants[0].checkIn?.eventDayId).toBe("day-1");
      expect(parsed.participants[0].checkIn?.checkInId).toBe("checkin-1");
    });

    it("should parse participants with no check-ins for selected event day", () => {
      const normalized = normalizeCheckInForEventDay(
        baseRawCheckInData,
        "day-1",
      );
      const parsed = GetCheckInForDateSchema.parse(normalized);

      expect(parsed.participants[0].checkIn).toBeNull();
    });

    it("should reject duplicate check-ins for the same event day", () => {
      const normalized = normalizeCheckInForEventDay(
        {
          ...baseRawCheckInData,
          participants: [
            {
              ...baseRawCheckInData.participants[0],
              checkIn: [
                {
                  checkInId: "checkin-1",
                  checkInTime: "2026-01-01T11:00:00+08:00",
                  eventDayId: "day-1",
                  remarks: null,
                },
                {
                  checkInId: "checkin-2",
                  checkInTime: "2026-01-01T12:00:00+08:00",
                  eventDayId: "day-1",
                  remarks: "Duplicate",
                },
              ],
            },
          ],
        },
        "day-1",
      );

      expect(() => GetCheckInForDateSchema.parse(normalized)).toThrow(
        "Multiple check-ins found for a single participant. Data integrity issue.",
      );
    });
  });
});
