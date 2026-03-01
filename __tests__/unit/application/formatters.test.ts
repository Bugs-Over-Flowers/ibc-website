import { describe, expect, it } from "vitest";
import { toPascalCaseWithSpaces } from "@/app/admin/application/_utils/formatters";

/**
 * ============================================================================
 * UNIT TESTS: Application Formatters Utility
 * ============================================================================
 *
 * Tests the `toPascalCaseWithSpaces` utility used for displaying
 * application types (e.g., "newMember" → "New Member") in the UI.
 */

describe("toPascalCaseWithSpaces", () => {
  // ✅ HAPPY FLOW: camelCase input
  it('should convert "newMember" to "New Member"', () => {
    expect(toPascalCaseWithSpaces("newMember")).toBe("New Member");
  });

  // ✅ HAPPY FLOW: snake_case input
  it('should convert "regular_member" to "Regular Member"', () => {
    expect(toPascalCaseWithSpaces("regular_member")).toBe("Regular Member");
  });

  // ✅ HAPPY FLOW: kebab-case input
  it('should convert "gold-member" to "Gold Member"', () => {
    expect(toPascalCaseWithSpaces("gold-member")).toBe("Gold Member");
  });

  // ✅ HAPPY FLOW: Single word
  it('should convert single word "renewal" to "Renewal"', () => {
    expect(toPascalCaseWithSpaces("renewal")).toBe("Renewal");
  });

  // ✅ HAPPY FLOW: Multiple camelCase words
  it('should convert "applicationNewMember" to "Application New Member"', () => {
    expect(toPascalCaseWithSpaces("applicationNewMember")).toBe(
      "Application New Member",
    );
  });

  // ✅ HAPPY FLOW: All application types used in the system
  it("should correctly format all known application types", () => {
    expect(toPascalCaseWithSpaces("newMember")).toBe("New Member");
    expect(toPascalCaseWithSpaces("updating")).toBe("Updating");
    expect(toPascalCaseWithSpaces("renewal")).toBe("Renewal");
  });

  // ✅ HAPPY FLOW: Already PascalCase
  it("should handle already PascalCase input", () => {
    const result = toPascalCaseWithSpaces("NewMember");
    expect(result).toBe("New Member");
  });

  // ❌ ERROR FLOW: Empty string
  it("should handle empty string gracefully", () => {
    expect(toPascalCaseWithSpaces("")).toBe("");
  });

  // ❌ ERROR FLOW: String with only separators
  it("should handle string with only separators", () => {
    const result = toPascalCaseWithSpaces("---");
    expect(result).toBe("");
  });

  // ❌ ERROR FLOW: Single character
  it("should capitalize single character", () => {
    expect(toPascalCaseWithSpaces("a")).toBe("A");
  });

  // ✅ HAPPY FLOW: Mixed separators
  it("should handle mixed separators", () => {
    const result = toPascalCaseWithSpaces("some_mixed-case");
    expect(result).toBe("Some Mixed Case");
  });

  // ✅ HAPPY FLOW: All uppercase
  it("should handle all uppercase input", () => {
    const result = toPascalCaseWithSpaces("ABC");
    expect(result).toBe("A B C");
  });
});
