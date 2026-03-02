import { describe, expect, it } from "vitest";
import {
  applicationDecisionSchema,
  memberFilterSchema,
  scheduleMeetingSchema,
} from "@/lib/validation/application/application";

/**
 * ============================================================================
 * UNIT TESTS: Validation Schemas for Members & Applications Features
 * ============================================================================
 *
 * These tests validate that Zod schemas correctly enforce input constraints
 * for member filtering, application decisions, and meeting scheduling.
 */

// ---------------------------------------------------------------------------
// memberFilterSchema
// ---------------------------------------------------------------------------
describe("memberFilterSchema", () => {
  // ✅ HAPPY FLOW: Valid filter with all fields
  it("should accept valid filter with all fields", () => {
    const input = {
      status: "paid",
      sectorName: "Technology",
      search: "Acme",
    };

    const result = memberFilterSchema.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(input);
  });

  // ✅ HAPPY FLOW: Valid filter with status only
  it("should accept valid status filter", () => {
    const result = memberFilterSchema.safeParse({ status: "unpaid" });

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe("unpaid");
  });

  // ✅ HAPPY FLOW: All valid statuses are accepted
  it.each([
    "paid",
    "unpaid",
    "cancelled",
    "all",
  ] as const)('should accept status "%s"', (status) => {
    const result = memberFilterSchema.safeParse({ status });

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe(status);
  });

  // ✅ HAPPY FLOW: Empty object defaults to valid
  it("should accept empty object with defaults", () => {
    const result = memberFilterSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  // ✅ HAPPY FLOW: Search with special characters
  it("should accept search with special characters", () => {
    const result = memberFilterSchema.safeParse({
      search: "Acme & Co. (LLC)",
    });

    expect(result.success).toBe(true);
    expect(result.data?.search).toBe("Acme & Co. (LLC)");
  });

  // ❌ ERROR FLOW: Invalid status value
  it("should reject invalid status value", () => {
    const result = memberFilterSchema.safeParse({ status: "active" });

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Status is not a string
  it("should reject numeric status", () => {
    const result = memberFilterSchema.safeParse({ status: 123 });

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Empty string status
  it("should reject empty string status", () => {
    const result = memberFilterSchema.safeParse({ status: "" });

    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// applicationDecisionSchema
// ---------------------------------------------------------------------------
describe("applicationDecisionSchema", () => {
  // ✅ HAPPY FLOW: Approve action with valid UUID
  it("should accept valid approve decision", () => {
    const input = {
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "approve",
    };

    const result = applicationDecisionSchema.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(input);
  });

  // ✅ HAPPY FLOW: Reject action with valid UUID
  it("should accept valid reject decision", () => {
    const input = {
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "reject",
    };

    const result = applicationDecisionSchema.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.action).toBe("reject");
  });

  // ✅ HAPPY FLOW: Decision with optional notes
  it("should accept decision with notes", () => {
    const input = {
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "approve",
      notes: "All documents verified, approved for membership.",
    };

    const result = applicationDecisionSchema.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.notes).toBe(
      "All documents verified, approved for membership.",
    );
  });

  // ✅ HAPPY FLOW: Decision without notes (optional field)
  it("should accept decision without notes", () => {
    const input = {
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "reject",
    };

    const result = applicationDecisionSchema.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.notes).toBeUndefined();
  });

  // ❌ ERROR FLOW: Missing applicationId
  it("should reject when applicationId is missing", () => {
    const result = applicationDecisionSchema.safeParse({ action: "approve" });

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Invalid UUID format
  it("should reject invalid applicationId format", () => {
    const result = applicationDecisionSchema.safeParse({
      applicationId: "not-a-uuid",
      action: "approve",
    });

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Invalid action
  it("should reject invalid action value", () => {
    const result = applicationDecisionSchema.safeParse({
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "suspend",
    });

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Missing action field
  it("should reject when action is missing", () => {
    const result = applicationDecisionSchema.safeParse({
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
    });

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Empty applicationId
  it("should reject empty applicationId", () => {
    const result = applicationDecisionSchema.safeParse({
      applicationId: "",
      action: "approve",
    });

    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// scheduleMeetingSchema
// ---------------------------------------------------------------------------
describe("scheduleMeetingSchema", () => {
  // ✅ HAPPY FLOW: Valid meeting schedule with string date
  it("should accept valid meeting with string date", () => {
    const input = {
      applicationIds: ["123e4567-e89b-12d3-a456-426614174000"],
      interviewDate: "2026-03-15T10:00:00Z",
      interviewVenue: "IBC Conference Room A",
    };

    const result = scheduleMeetingSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  // ✅ HAPPY FLOW: Valid meeting schedule with Date object
  it("should accept valid meeting with Date object", () => {
    const input = {
      applicationIds: ["123e4567-e89b-12d3-a456-426614174000"],
      interviewDate: new Date("2026-03-15T10:00:00Z"),
      interviewVenue: "IBC Conference Room A",
    };

    const result = scheduleMeetingSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  // ✅ HAPPY FLOW: Multiple application IDs
  it("should accept multiple application IDs", () => {
    const input = {
      applicationIds: [
        "123e4567-e89b-12d3-a456-426614174000",
        "123e4567-e89b-12d3-a456-426614174001",
        "123e4567-e89b-12d3-a456-426614174002",
      ],
      interviewDate: "2026-03-15T10:00:00Z",
      interviewVenue: "IBC Main Hall",
    };

    const result = scheduleMeetingSchema.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.applicationIds).toHaveLength(3);
  });

  // ✅ HAPPY FLOW: With optional custom message
  it("should accept meeting with custom message", () => {
    const input = {
      applicationIds: ["123e4567-e89b-12d3-a456-426614174000"],
      interviewDate: "2026-03-15T10:00:00Z",
      interviewVenue: "IBC Conference Room",
      customMessage: "Please bring all required documents.",
    };

    const result = scheduleMeetingSchema.safeParse(input);

    expect(result.success).toBe(true);
    expect(result.data?.customMessage).toBe(
      "Please bring all required documents.",
    );
  });

  // ❌ ERROR FLOW: Empty applicationIds array
  it("should reject empty applicationIds array", () => {
    const result = scheduleMeetingSchema.safeParse({
      applicationIds: [],
      interviewDate: "2026-03-15T10:00:00Z",
      interviewVenue: "IBC Conference Room",
    });

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Invalid UUID in applicationIds
  it("should reject invalid UUID in applicationIds", () => {
    const result = scheduleMeetingSchema.safeParse({
      applicationIds: ["not-a-valid-uuid"],
      interviewDate: "2026-03-15T10:00:00Z",
      interviewVenue: "IBC Conference Room",
    });

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Empty interview date
  it("should reject empty interview date", () => {
    const result = scheduleMeetingSchema.safeParse({
      applicationIds: ["123e4567-e89b-12d3-a456-426614174000"],
      interviewDate: "",
      interviewVenue: "IBC Conference Room",
    });

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Venue too short (less than 3 chars)
  it("should reject venue shorter than 3 characters", () => {
    const result = scheduleMeetingSchema.safeParse({
      applicationIds: ["123e4567-e89b-12d3-a456-426614174000"],
      interviewDate: "2026-03-15T10:00:00Z",
      interviewVenue: "AB",
    });

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Missing required fields
  it("should reject when all required fields are missing", () => {
    const result = scheduleMeetingSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  // ❌ ERROR FLOW: Missing interviewVenue
  it("should reject when interviewVenue is missing", () => {
    const result = scheduleMeetingSchema.safeParse({
      applicationIds: ["123e4567-e89b-12d3-a456-426614174000"],
      interviewDate: "2026-03-15T10:00:00Z",
    });

    expect(result.success).toBe(false);
  });
});
