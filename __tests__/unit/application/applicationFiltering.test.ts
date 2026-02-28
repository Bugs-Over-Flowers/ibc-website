import { describe, expect, it } from "vitest";
import type { ApplicationWithMembers } from "@/lib/types/application";
import {
  createMockApplication,
  mockApplications,
} from "../../__fixtures__/applications";

/**
 * ============================================================================
 * UNIT TESTS: Application List Filtering Logic
 * ============================================================================
 *
 * Tests the filtering logic used in ApplicationsList component to categorize
 * applications into "new", "pending", and "finished" tabs.
 *
 * This logic is extracted here because the component is a Server Component
 * and cannot be rendered in unit tests. We test the pure business logic.
 */

/**
 * Replica of the filtering function from ApplicationsList component
 * Extracted here for testability.
 */
function filterApplicationsByStatus(
  applications: ApplicationWithMembers[],
  status: "new" | "pending" | "finished",
) {
  return applications.filter((app) => {
    if (status === "new") {
      return app.applicationStatus === "new";
    }
    if (status === "pending") {
      return app.applicationStatus === "pending";
    }
    if (status === "finished") {
      return (
        app.applicationStatus === "approved" ||
        app.applicationStatus === "rejected"
      );
    }
    return false;
  });
}

describe("filterApplicationsByStatus", () => {
  // ✅ HAPPY FLOW: Filter new applications
  it('should return only "new" applications when status is "new"', () => {
    const result = filterApplicationsByStatus(mockApplications, "new");

    expect(result.length).toBe(2); // app-001 and app-002
    expect(result.every((app) => app.applicationStatus === "new")).toBe(true);
  });

  // ✅ HAPPY FLOW: Filter pending applications
  it('should return only "pending" applications when status is "pending"', () => {
    const result = filterApplicationsByStatus(mockApplications, "pending");

    expect(result.length).toBe(1); // app-003
    expect(result.every((app) => app.applicationStatus === "pending")).toBe(
      true,
    );
    expect(result[0].applicationId).toBe("app-003");
  });

  // ✅ HAPPY FLOW: Filter finished applications (approved + rejected)
  it('should return "approved" and "rejected" applications when status is "finished"', () => {
    const result = filterApplicationsByStatus(mockApplications, "finished");

    expect(result.length).toBe(2); // app-004 (approved) and app-005 (rejected)
    expect(
      result.every(
        (app) =>
          app.applicationStatus === "approved" ||
          app.applicationStatus === "rejected",
      ),
    ).toBe(true);
  });

  // ✅ HAPPY FLOW: Each application appears in exactly one tab
  it("should ensure all applications are accounted for across all tabs", () => {
    const newApps = filterApplicationsByStatus(mockApplications, "new");
    const pendingApps = filterApplicationsByStatus(mockApplications, "pending");
    const finishedApps = filterApplicationsByStatus(
      mockApplications,
      "finished",
    );

    const totalFiltered =
      newApps.length + pendingApps.length + finishedApps.length;
    expect(totalFiltered).toBe(mockApplications.length);
  });

  // ✅ HAPPY FLOW: No duplicates across tabs
  it("should not have the same application in multiple tabs", () => {
    const newIds = filterApplicationsByStatus(mockApplications, "new").map(
      (a) => a.applicationId,
    );
    const pendingIds = filterApplicationsByStatus(
      mockApplications,
      "pending",
    ).map((a) => a.applicationId);
    const finishedIds = filterApplicationsByStatus(
      mockApplications,
      "finished",
    ).map((a) => a.applicationId);

    const allIds = [...newIds, ...pendingIds, ...finishedIds];
    const uniqueIds = new Set(allIds);

    expect(allIds.length).toBe(uniqueIds.size);
  });

  // ❌ ERROR FLOW: Empty applications array
  it("should return empty array when no applications exist", () => {
    const result = filterApplicationsByStatus([], "new");

    expect(result).toEqual([]);
  });

  // ❌ ERROR FLOW: No matching applications for a tab
  it("should return empty array when no applications match the status", () => {
    const onlyNewApplications = [
      createMockApplication({ applicationStatus: "new" }),
    ];

    const pending = filterApplicationsByStatus(onlyNewApplications, "pending");
    const finished = filterApplicationsByStatus(
      onlyNewApplications,
      "finished",
    );

    expect(pending).toEqual([]);
    expect(finished).toEqual([]);
  });

  // ✅ HAPPY FLOW: All applications have same status
  it("should return all when all applications are new", () => {
    const allNew = [
      createMockApplication({ applicationId: "a1", applicationStatus: "new" }),
      createMockApplication({ applicationId: "a2", applicationStatus: "new" }),
      createMockApplication({ applicationId: "a3", applicationStatus: "new" }),
    ];

    const result = filterApplicationsByStatus(allNew, "new");

    expect(result.length).toBe(3);
  });

  // ✅ HAPPY FLOW: Finished tab includes both approved and rejected
  it("should include both approved and rejected in finished tab", () => {
    const mixedFinished = [
      createMockApplication({
        applicationId: "a1",
        applicationStatus: "approved",
      }),
      createMockApplication({
        applicationId: "a2",
        applicationStatus: "rejected",
      }),
      createMockApplication({
        applicationId: "a3",
        applicationStatus: "approved",
      }),
    ];

    const result = filterApplicationsByStatus(mixedFinished, "finished");

    expect(result.length).toBe(3);
    expect(
      result.filter((a) => a.applicationStatus === "approved").length,
    ).toBe(2);
    expect(
      result.filter((a) => a.applicationStatus === "rejected").length,
    ).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Application type badge color mapping logic
// ---------------------------------------------------------------------------
function getApplicationTypeColor(type: string): {
  borderColor: string;
  textColor: string;
} {
  switch (type) {
    case "newMember":
      return {
        borderColor: "border-status-green",
        textColor: "text-status-green",
      };
    case "updating":
      return {
        borderColor: "border-status-yellow",
        textColor: "text-status-yellow",
      };
    case "renewal":
      return {
        borderColor: "border-status-blue",
        textColor: "text-status-blue",
      };
    default:
      return {
        borderColor: "border-muted",
        textColor: "text-muted-foreground",
      };
  }
}

describe("getApplicationTypeColor", () => {
  // ✅ HAPPY FLOW: Each application type returns correct colors
  it("should return green colors for newMember", () => {
    const result = getApplicationTypeColor("newMember");

    expect(result.borderColor).toBe("border-status-green");
    expect(result.textColor).toBe("text-status-green");
  });

  it("should return yellow colors for updating", () => {
    const result = getApplicationTypeColor("updating");

    expect(result.borderColor).toBe("border-status-yellow");
    expect(result.textColor).toBe("text-status-yellow");
  });

  it("should return blue colors for renewal", () => {
    const result = getApplicationTypeColor("renewal");

    expect(result.borderColor).toBe("border-status-blue");
    expect(result.textColor).toBe("text-status-blue");
  });

  // ❌ ERROR FLOW: Unknown application type falls back to muted
  it("should return muted colors for unknown type", () => {
    const result = getApplicationTypeColor("unknownType");

    expect(result.borderColor).toBe("border-muted");
    expect(result.textColor).toBe("text-muted-foreground");
  });

  // ❌ ERROR FLOW: Empty string falls back to muted
  it("should return muted colors for empty string", () => {
    const result = getApplicationTypeColor("");

    expect(result.borderColor).toBe("border-muted");
    expect(result.textColor).toBe("text-muted-foreground");
  });
});

// ---------------------------------------------------------------------------
// Empty state description logic
// ---------------------------------------------------------------------------
function getDescription(status: "new" | "pending" | "finished"): string {
  const descriptions = {
    new: "new",
    pending: "pending",
    finished: "approved",
  };
  return `There are no ${descriptions[status]} applications at the moment.`;
}

describe("getDescription (EmptyApplicationsState)", () => {
  // ✅ HAPPY FLOW: Each status returns the correct message
  it('should return correct description for "new" status', () => {
    expect(getDescription("new")).toBe(
      "There are no new applications at the moment.",
    );
  });

  it('should return correct description for "pending" status', () => {
    expect(getDescription("pending")).toBe(
      "There are no pending applications at the moment.",
    );
  });

  it('should return correct description for "finished" status', () => {
    expect(getDescription("finished")).toBe(
      "There are no approved applications at the moment.",
    );
  });
});

// ---------------------------------------------------------------------------
// Applications stats counting logic
// ---------------------------------------------------------------------------
function countApplicationsByStatus(
  applications: Array<{ applicationStatus: string | null }>,
) {
  return applications.reduce(
    (acc, app) => {
      const status = app.applicationStatus as
        | "new"
        | "pending"
        | "approved"
        | "rejected"
        | undefined;
      if (status === "new") acc.new += 1;
      else if (status === "pending") acc.pending += 1;
      else if (status === "approved" || status === "rejected")
        acc.finished += 1;
      return acc;
    },
    { new: 0, pending: 0, finished: 0 },
  );
}

describe("countApplicationsByStatus (ApplicationsStats logic)", () => {
  // ✅ HAPPY FLOW: Correctly counts all categories
  it("should count applications by status category", () => {
    const counts = countApplicationsByStatus(mockApplications);

    expect(counts.new).toBe(2);
    expect(counts.pending).toBe(1);
    expect(counts.finished).toBe(2); // 1 approved + 1 rejected
  });

  // ✅ HAPPY FLOW: Empty array returns all zeros
  it("should return zero counts for empty array", () => {
    const counts = countApplicationsByStatus([]);

    expect(counts.new).toBe(0);
    expect(counts.pending).toBe(0);
    expect(counts.finished).toBe(0);
  });

  // ✅ HAPPY FLOW: Only new applications
  it("should correctly count when all applications are new", () => {
    const allNew = [
      { applicationStatus: "new" },
      { applicationStatus: "new" },
      { applicationStatus: "new" },
    ];

    const counts = countApplicationsByStatus(allNew);

    expect(counts.new).toBe(3);
    expect(counts.pending).toBe(0);
    expect(counts.finished).toBe(0);
  });

  // ❌ ERROR FLOW: Unknown status is ignored
  it("should ignore applications with unknown status", () => {
    const withUnknown = [
      { applicationStatus: "new" },
      { applicationStatus: "draft" }, // unknown
      { applicationStatus: "approved" },
    ];

    const counts = countApplicationsByStatus(withUnknown);

    expect(counts.new).toBe(1);
    expect(counts.finished).toBe(1);
    expect(counts.pending).toBe(0);
  });

  // ❌ ERROR FLOW: Null status is ignored
  it("should handle null applicationStatus gracefully", () => {
    const withNull = [
      { applicationStatus: "new" },
      { applicationStatus: null },
    ];

    const counts = countApplicationsByStatus(withNull);

    expect(counts.new).toBe(1);
    expect(counts.pending).toBe(0);
    expect(counts.finished).toBe(0);
  });
});
