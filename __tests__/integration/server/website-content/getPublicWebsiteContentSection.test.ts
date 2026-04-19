import { beforeEach, describe, expect, it, vi } from "vitest";

const mockEqIsActive = vi.fn();
const mockEqSection = vi.fn(() => ({ eq: mockEqIsActive }));
const mockSelect = vi.fn(() => ({ eq: mockEqSection }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockCreateClient = vi.fn(async () => ({ from: mockFrom }));
const mockCookies = vi.fn(async () => ({
  getAll: () => [{ name: "sb-access-token", value: "token" }],
}));
const mockApplyRealtime60sCache = vi.fn();
const mockCacheTag = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => ({
  cacheTag: mockCacheTag,
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("@/lib/cache/profiles", () => ({
  applyRealtime60sCache: mockApplyRealtime60sCache,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("@/server/website-content/schemas", () => ({
  websiteContentSectionSchema: {
    parse: (value: unknown) => value,
  },
}));

const { getPublicWebsiteContentSection } = await import(
  "@/server/website-content/queries/getPublicWebsiteContentSection"
);

describe("getPublicWebsiteContentSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEqSection });
    mockEqSection.mockReturnValue({ eq: mockEqIsActive });
  });

  it("returns empty section payload when no rows exist", async () => {
    mockEqIsActive.mockResolvedValueOnce({ data: [], error: null });

    const result = await getPublicWebsiteContentSection("goals");

    expect(result).toEqual({
      section: "goals",
      hasRows: false,
      visionParagraph: "",
      missionParagraph: "",
      cards: [],
    });
    expect(mockCreateClient).toHaveBeenCalledWith([
      { name: "sb-access-token", value: "token" },
    ]);
  });

  it("parses vision_mission rows into vision and mission paragraphs", async () => {
    mockEqIsActive.mockResolvedValueOnce({
      data: [
        {
          entryKey: "vision",
          textType: "Paragraph",
          textValue: "Vision content",
          icon: null,
          imageUrl: null,
          cardPlacement: null,
          group: null,
        },
        {
          entryKey: "mission",
          textType: "Paragraph",
          textValue: "Mission content",
          icon: null,
          imageUrl: null,
          cardPlacement: null,
          group: null,
        },
      ],
      error: null,
    });

    const result = await getPublicWebsiteContentSection("vision_mission");

    expect(result).toEqual({
      section: "vision_mission",
      hasRows: true,
      visionParagraph: "Vision content",
      missionParagraph: "Mission content",
      cards: [],
    });
  });

  it("merges rows by entryKey and sorts cards by placement then entryKey", async () => {
    mockEqIsActive.mockResolvedValueOnce({
      data: [
        {
          entryKey: "c",
          textType: "Title",
          textValue: "C title",
          icon: null,
          imageUrl: null,
          cardPlacement: 2,
          group: "trustees",
        },
        {
          entryKey: "b",
          textType: "Title",
          textValue: "B title",
          icon: null,
          imageUrl: null,
          cardPlacement: 2,
          group: "officers",
        },
        {
          entryKey: "a",
          textType: "Title",
          textValue: "A title",
          icon: null,
          imageUrl: "https://cdn.example.com/headerimage/a.jpg",
          cardPlacement: 1,
          group: "featured",
        },
        {
          entryKey: "a",
          textType: "Subtitle",
          textValue: "A subtitle",
          icon: null,
          imageUrl: null,
          cardPlacement: 1,
          group: "featured",
        },
        {
          entryKey: "a",
          textType: "Paragraph",
          textValue: "A paragraph",
          icon: "Globe",
          imageUrl: "website-content/board/a.jpg",
          cardPlacement: 1,
          group: "featured",
        },
      ],
      error: null,
    });

    const result = await getPublicWebsiteContentSection("board_of_trustees");

    expect(result.hasRows).toBe(true);
    expect(result.cards.map((card) => card.entryKey)).toEqual(["a", "b", "c"]);
    expect(result.cards[0]).toMatchObject({
      entryKey: "a",
      title: "A title",
      subtitle: "A subtitle",
      paragraph: "A paragraph",
      icon: "Globe",
      group: "featured",
      cardPlacement: "1",
      imageUrl:
        "https://example.supabase.co/storage/v1/object/public/personalimage/website-content/board/a.jpg",
    });
  });

  it("normalizes storage API image URLs from headerimage to personalimage", async () => {
    mockEqIsActive.mockResolvedValueOnce({
      data: [
        {
          entryKey: "row-1",
          textType: "Title",
          textValue: "Row title",
          icon: null,
          imageUrl: "storage/v1/object/public/headerimage/members/pic.jpg",
          cardPlacement: 1,
          group: "officers",
        },
      ],
      error: null,
    });

    const result = await getPublicWebsiteContentSection("secretariat");

    expect(result.cards[0]?.imageUrl).toBe(
      "https://example.supabase.co/storage/v1/object/public/personalimage/members/pic.jpg",
    );
  });
});
