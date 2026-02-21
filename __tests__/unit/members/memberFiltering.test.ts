import { describe, expect, it } from "vitest";
import { createMockMember, mockMembers } from "../../__fixtures__/members";

/**
 * ============================================================================
 * UNIT TESTS: Members Feature – Filtering & Display Logic
 * ============================================================================
 *
 * Tests the business logic underlying the Members directory:
 * - Filter parsing and validation
 * - Membership status badge variant determination
 * - Empty state conditions
 * - Member selection logic (isUpdateDisabled computation)
 */

// ---------------------------------------------------------------------------
// Filter status validation (mirrors MembersList component logic)
// ---------------------------------------------------------------------------

const allowedStatuses = ["paid", "unpaid", "cancelled", "all"] as const;

function parseStatusFilter(
  rawStatus: string | undefined,
): (typeof allowedStatuses)[number] | undefined {
  if (rawStatus && (allowedStatuses as readonly string[]).includes(rawStatus)) {
    return rawStatus as (typeof allowedStatuses)[number];
  }
  return undefined;
}

describe("parseStatusFilter (MembersList)", () => {
  // ✅ HAPPY FLOW: Valid statuses
  it.each([
    "paid",
    "unpaid",
    "cancelled",
    "all",
  ] as const)('should accept "%s" as valid status', (status) => {
    expect(parseStatusFilter(status)).toBe(status);
  });

  // ❌ ERROR FLOW: Invalid status returns undefined
  it("should return undefined for invalid status", () => {
    expect(parseStatusFilter("active")).toBeUndefined();
    expect(parseStatusFilter("deleted")).toBeUndefined();
    expect(parseStatusFilter("")).toBeUndefined();
  });

  // ❌ ERROR FLOW: Undefined input
  it("should return undefined when no status provided", () => {
    expect(parseStatusFilter(undefined)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Membership status badge logic (mirrors MembersTableRow)
// ---------------------------------------------------------------------------

function getMembershipBadgeVariant(status: string): "default" | "destructive" {
  if (status === "paid" || status === "cancelled") {
    return "default";
  }
  return "destructive";
}

function getMembershipBadgeClassName(status: string): string {
  if (status === "cancelled") {
    return "bg-gray-900 text-white capitalize";
  }
  return "bg-background text-muted-foreground capitalize";
}

describe("Membership status badge logic", () => {
  // ✅ HAPPY FLOW: Paid uses default variant
  it('should use "default" variant for paid status', () => {
    expect(getMembershipBadgeVariant("paid")).toBe("default");
  });

  // ✅ HAPPY FLOW: Unpaid uses destructive variant
  it('should use "destructive" variant for unpaid status', () => {
    expect(getMembershipBadgeVariant("unpaid")).toBe("destructive");
  });

  // ✅ HAPPY FLOW: Cancelled uses default variant
  it('should use "default" variant for cancelled status', () => {
    expect(getMembershipBadgeVariant("cancelled")).toBe("default");
  });

  // ✅ HAPPY FLOW: Cancelled has dark background styling
  it("should apply dark background for cancelled status", () => {
    expect(getMembershipBadgeClassName("cancelled")).toContain("bg-gray-900");
  });

  // ✅ HAPPY FLOW: Non-cancelled statuses have default styling
  it("should apply default background for paid status", () => {
    expect(getMembershipBadgeClassName("paid")).toContain("bg-background");
  });
});

// ---------------------------------------------------------------------------
// Member selection logic (mirrors useMemberSelection)
// ---------------------------------------------------------------------------

describe("Member selection business logic", () => {
  function computeIsUpdateDisabled(
    isPending: boolean,
    selectedCount: number,
    selectedStatus: string | null,
  ): boolean {
    return isPending || selectedCount === 0 || !selectedStatus;
  }

  // ✅ HAPPY FLOW: Enabled when conditions are met
  it("should be enabled when members selected and status chosen", () => {
    expect(computeIsUpdateDisabled(false, 2, "paid")).toBe(false);
  });

  // ❌ ERROR FLOW: Disabled when no members selected
  it("should be disabled when no members are selected", () => {
    expect(computeIsUpdateDisabled(false, 0, "paid")).toBe(true);
  });

  // ❌ ERROR FLOW: Disabled when no status selected
  it("should be disabled when no status is selected", () => {
    expect(computeIsUpdateDisabled(false, 3, null)).toBe(true);
  });

  // ❌ ERROR FLOW: Disabled while action is pending
  it("should be disabled while action is pending", () => {
    expect(computeIsUpdateDisabled(true, 2, "paid")).toBe(true);
  });

  // ❌ ERROR FLOW: Disabled when all conditions fail
  it("should be disabled when all conditions fail", () => {
    expect(computeIsUpdateDisabled(true, 0, null)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Member display data
// ---------------------------------------------------------------------------

describe("Member display data", () => {
  // ✅ HAPPY FLOW: Member with all fields
  it("should display all basic member information", () => {
    const member = mockMembers[0];

    expect(member.businessName).toBe("Acme Technologies");
    expect(member.Sector.sectorName).toBe("Technology");
    expect(member.websiteURL).toBe("https://acme.example.com");
    expect(member.membershipStatus).toBe("paid");
    expect(member.logoImageURL).toBe("https://example.com/logo.png");
  });

  // ✅ HAPPY FLOW: Member without logo shows first letter
  it("should use first character of business name when no logo", () => {
    const member = createMockMember({ logoImageURL: null });
    const fallbackChar = member.businessName.charAt(0).toUpperCase();

    expect(fallbackChar).toBe("A");
  });

  // ✅ HAPPY FLOW: Member without website shows nothing
  it("should handle null website gracefully", () => {
    const member = mockMembers[2]; // Gamma Healthcare - no website

    expect(member.websiteURL).toBeUndefined();
  });

  // ✅ HAPPY FLOW: Join date can be formatted
  it("should have a parseable join date", () => {
    const member = mockMembers[0];
    const date = new Date(member.joinDate);

    expect(date).toBeInstanceOf(Date);
    expect(Number.isNaN(date.getTime())).toBe(false);
  });

  // ✅ HAPPY FLOW: Sector displays correctly
  it("should have sector information", () => {
    const member = mockMembers[1]; // Beta Finance Corp

    expect(member.Sector.sectorName).toBe("Finance");
    expect(member.Sector.sectorId).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// MemberFilters – hasActiveFilters logic
// ---------------------------------------------------------------------------

describe("hasActiveFilters (MemberFilters)", () => {
  function hasActiveFilters(
    currentStatus: string,
    currentSector: string,
    currentSearch: string,
  ): boolean {
    return (
      currentStatus !== "all" ||
      (currentSector !== "" && currentSector !== "all") ||
      currentSearch !== ""
    );
  }

  // ✅ HAPPY FLOW: No filters active
  it("should return false when all defaults", () => {
    expect(hasActiveFilters("all", "all", "")).toBe(false);
  });

  // ✅ HAPPY FLOW: Status filter active
  it("should return true when status is not all", () => {
    expect(hasActiveFilters("paid", "all", "")).toBe(true);
  });

  // ✅ HAPPY FLOW: Sector filter active
  it("should return true when sector is selected", () => {
    expect(hasActiveFilters("all", "Technology", "")).toBe(true);
  });

  // ✅ HAPPY FLOW: Search filter active
  it("should return true when search has value", () => {
    expect(hasActiveFilters("all", "all", "Acme")).toBe(true);
  });

  // ✅ HAPPY FLOW: All filters active
  it("should return true when all filters are active", () => {
    expect(hasActiveFilters("paid", "Technology", "Acme")).toBe(true);
  });
});
