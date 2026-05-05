import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEq = vi.fn();
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockCreateClient = vi.fn(async () => ({ from: mockFrom }));
const mockCookies = vi.fn(async () => ({
  getAll: () => [{ name: "sb-access-token", value: "token" }],
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

const { getWebsiteContentSectionsSummary } = await import(
  "@/server/website-content/queries/getWebsiteContentSectionsSummary"
);

describe("getWebsiteContentSectionsSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("returns empty summary defaults when no rows exist", async () => {
    mockEq.mockResolvedValueOnce({ data: [], error: null });

    const result = await getWebsiteContentSectionsSummary();

    expect(result).toEqual({
      vision_mission: { updatedAt: null, cardCount: 0 },
      goals: { updatedAt: null, cardCount: 0 },
      company_thrusts: { updatedAt: null, cardCount: 0 },
      board_of_trustees: { updatedAt: null, cardCount: 0 },
      secretariat: { updatedAt: null, cardCount: 0 },
      landing_page_benefits: { updatedAt: null, cardCount: 0 },
    });
    expect(mockFrom).toHaveBeenCalledWith("WebsiteContent");
    expect(mockCreateClient).toHaveBeenCalledWith([
      { name: "sb-access-token", value: "token" },
    ]);
    expect(mockEq).toHaveBeenCalledWith("isActive", true);
  });

  it("aggregates latest updatedAt and distinct card counts by section", async () => {
    mockEq.mockResolvedValueOnce({
      data: [
        {
          section: "goals",
          entryKey: "goal-1",
          updatedAt: "2026-04-26T09:00:00.000Z",
        },
        {
          section: "goals",
          entryKey: "goal-1",
          updatedAt: "2026-04-26T10:00:00.000Z",
        },
        {
          section: "goals",
          entryKey: "goal-2",
          updatedAt: "2026-04-26T08:00:00.000Z",
        },
        {
          section: "board_of_trustees",
          entryKey: "trustee-1",
          updatedAt: "2026-04-25T08:00:00.000Z",
        },
      ],
      error: null,
    });

    const result = await getWebsiteContentSectionsSummary();

    expect(result.goals).toEqual({
      updatedAt: "2026-04-26T10:00:00.000Z",
      cardCount: 2,
    });
    expect(result.board_of_trustees).toEqual({
      updatedAt: "2026-04-25T08:00:00.000Z",
      cardCount: 1,
    });
    expect(result.vision_mission).toEqual({ updatedAt: null, cardCount: 0 });
  });

  it("throws when summary fetch fails", async () => {
    mockEq.mockResolvedValueOnce({
      data: null,
      error: { message: "permission denied" },
    });

    await expect(getWebsiteContentSectionsSummary()).rejects.toThrow(
      "Failed to fetch website content summary: permission denied",
    );
  });
});
