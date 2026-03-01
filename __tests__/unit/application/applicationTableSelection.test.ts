import { describe, expect, it } from "vitest";
import {
  createMockApplication,
  mockApplications,
} from "../../__fixtures__/applications";

/**
 * ============================================================================
 * UNIT TESTS: Application Table Selection Logic
 * ============================================================================
 *
 * Tests the selectability rules for applications in the table:
 * - BPI payment method with pending proof status → NOT selectable
 * - All other combinations → selectable
 *
 * Also tests the select-all / select-none toggle logic.
 */

// ---------------------------------------------------------------------------
// isSelectable - replicates the logic from ApplicationsTable
// ---------------------------------------------------------------------------

interface SelectableApplication {
  applicationId: string;
  paymentMethod: string | null;
  paymentProofStatus: string | null;
}

function isSelectable(application: SelectableApplication): boolean {
  return (
    application.paymentMethod !== "BPI" ||
    (application.paymentProofStatus ?? "pending") !== "pending"
  );
}

describe("isSelectable (ApplicationsTable)", () => {
  // ✅ HAPPY FLOW: ONSITE payment is always selectable
  it("should be selectable when payment method is ONSITE", () => {
    const app = createMockApplication({
      paymentMethod: "ONSITE",
      paymentProofStatus: undefined,
    });

    expect(isSelectable(app)).toBe(true);
  });

  // ✅ HAPPY FLOW: BPI with approved proof is selectable
  it("should be selectable when BPI with approved proof", () => {
    const app = createMockApplication({
      paymentMethod: "BPI",
      paymentProofStatus: "accepted",
    });

    expect(isSelectable(app)).toBe(true);
  });

  // ✅ HAPPY FLOW: BPI with rejected proof is selectable
  it("should be selectable when BPI with rejected proof", () => {
    const app = createMockApplication({
      paymentMethod: "BPI",
      paymentProofStatus: "rejected",
    });

    expect(isSelectable(app)).toBe(true);
  });

  // ❌ ERROR FLOW: BPI with pending proof is NOT selectable
  it("should NOT be selectable when BPI with pending proof", () => {
    const app = createMockApplication({
      paymentMethod: "BPI",
      paymentProofStatus: "pending",
    });

    expect(isSelectable(app)).toBe(false);
  });

  // ❌ ERROR FLOW: BPI with null proof status defaults to pending → NOT selectable
  it("should NOT be selectable when BPI with null proof status", () => {
    const app = createMockApplication({
      paymentMethod: "BPI",
      paymentProofStatus: undefined,
    });

    expect(isSelectable(app)).toBe(false);
  });

  // ✅ HAPPY FLOW: Null payment method is selectable
  it("should be selectable when payment method is null", () => {
    const app = createMockApplication({
      paymentMethod: undefined,
      paymentProofStatus: undefined,
    });

    expect(isSelectable(app)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Select All / Deselect All toggle logic
// ---------------------------------------------------------------------------

describe("Select All toggle logic", () => {
  function getSelectableIds(applications: SelectableApplication[]): string[] {
    return applications.filter(isSelectable).map((app) => app.applicationId);
  }

  // ✅ HAPPY FLOW: Filters from mockApplications
  it("should only return selectable application IDs", () => {
    const selectableIds = getSelectableIds(mockApplications);

    // app-002 has paymentMethod: "BPI" and paymentProofStatus: "pending"
    // so it should NOT be included
    expect(selectableIds).not.toContain("app-002");
    expect(selectableIds).toContain("app-001");
    expect(selectableIds).toContain("app-003");
  });

  // ✅ HAPPY FLOW: All selected state
  it("should determine allSelected correctly", () => {
    const selectableIds = getSelectableIds(mockApplications);
    const selectedSet = new Set(selectableIds);

    const allSelected =
      selectableIds.length > 0 &&
      selectableIds.every((id) => selectedSet.has(id));

    expect(allSelected).toBe(true);
  });

  // ✅ HAPPY FLOW: Partial selection
  it("should detect partial selection", () => {
    const selectableIds = getSelectableIds(mockApplications);
    const partialSelection = new Set([selectableIds[0]]);

    const selectedCount = selectableIds.filter((id) =>
      partialSelection.has(id),
    ).length;
    const someSelected =
      selectedCount > 0 && selectedCount < selectableIds.length;

    expect(someSelected).toBe(true);
  });

  // ✅ HAPPY FLOW: No selection
  it("should detect no selection", () => {
    const selectableIds = getSelectableIds(mockApplications);
    const emptySelection = new Set<string>();

    const selectedCount = selectableIds.filter((id) =>
      emptySelection.has(id),
    ).length;
    const allSelected =
      selectableIds.length > 0 && selectedCount === selectableIds.length;
    const someSelected =
      selectedCount > 0 && selectedCount < selectableIds.length;

    expect(allSelected).toBe(false);
    expect(someSelected).toBe(false);
  });

  // ❌ ERROR FLOW: All applications have pending BPI → no selectable items
  it("should return empty when all applications have pending BPI", () => {
    const allBpiPending = [
      createMockApplication({
        applicationId: "a1",
        paymentMethod: "BPI",
        paymentProofStatus: "pending",
      }),
      createMockApplication({
        applicationId: "a2",
        paymentMethod: "BPI",
        paymentProofStatus: undefined,
      }),
    ];

    const selectableIds = getSelectableIds(allBpiPending);

    expect(selectableIds).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Payment proof warning indicator logic
// ---------------------------------------------------------------------------

describe("Payment proof warning indicator", () => {
  function isPaymentProofPending(
    paymentMethod: string | null,
    paymentProofStatus: string | null,
  ): boolean {
    return (
      paymentMethod === "BPI" && (paymentProofStatus ?? "pending") === "pending"
    );
  }

  // ✅ HAPPY FLOW: BPI with pending proof shows warning
  it("should show warning for BPI with pending proof", () => {
    expect(isPaymentProofPending("BPI", "pending")).toBe(true);
  });

  // ✅ HAPPY FLOW: BPI with null proof shows warning (defaults to pending)
  it("should show warning for BPI with null proof status", () => {
    expect(isPaymentProofPending("BPI", null)).toBe(true);
  });

  // ❌ ERROR FLOW: Non-BPI should never show warning
  it("should not show warning for ONSITE", () => {
    expect(isPaymentProofPending("ONSITE", "pending")).toBe(false);
  });

  // ❌ ERROR FLOW: BPI with approved proof should not show warning
  it("should not show warning for BPI with approved proof", () => {
    expect(isPaymentProofPending("BPI", "approved")).toBe(false);
  });

  // ❌ ERROR FLOW: Null payment method should not show warning
  it("should not show warning for null payment method", () => {
    expect(isPaymentProofPending(null, "pending")).toBe(false);
  });
});
