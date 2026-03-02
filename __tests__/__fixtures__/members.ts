import type { Database } from "@/lib/supabase/db.types";

type BusinessMember = Database["public"]["Tables"]["BusinessMember"]["Row"];
type Sector = Database["public"]["Tables"]["Sector"]["Row"];

export const mockSector: Sector = {
  sectorId: 1,
  sectorName: "Technology",
};

export const mockSectors: Sector[] = [
  mockSector,
  { sectorId: 2, sectorName: "Finance" },
  { sectorId: 3, sectorName: "Healthcare" },
  { sectorId: 4, sectorName: "Manufacturing" },
];

/**
 * Creates a mock member matching the shape returned by `getMembers()`.
 * Overrides can be passed to customize individual fields.
 */
export function createMockMember(
  overrides: Partial<
    BusinessMember & {
      Sector: Pick<Sector, "sectorId" | "sectorName">;
      primaryApplicationId: string | null;
    }
  > = {},
) {
  return {
    businessMemberId: "bm-001",
    identifier: "IBC-2025-001",
    businessName: "Acme Technologies",
    businessAddress: "123 Tech St, Iloilo City",
    websiteURL: "https://acme.example.com",
    logoImageURL: "https://example.com/logo.png",
    joinDate: "2025-01-15T00:00:00Z",
    membershipStatus: "paid" as const,
    primaryApplicationId: "app-001",
    sectorId: 1,
    Sector: { sectorId: 1, sectorName: "Technology" },
    ...overrides,
  };
}

export const mockMembers = [
  createMockMember(),
  createMockMember({
    businessMemberId: "bm-002",
    identifier: "IBC-2025-002",
    businessName: "Beta Finance Corp",
    websiteURL: "https://beta.example.com",
    membershipStatus: "unpaid",
    sectorId: 2,
    Sector: { sectorId: 2, sectorName: "Finance" },
    joinDate: "2025-02-10T00:00:00Z",
    primaryApplicationId: "app-002",
  }),
  createMockMember({
    businessMemberId: "bm-003",
    identifier: "IBC-2025-003",
    businessName: "Gamma Healthcare Inc",
    websiteURL: undefined,
    logoImageURL: undefined,
    membershipStatus: "cancelled",
    sectorId: 3,
    Sector: { sectorId: 3, sectorName: "Healthcare" },
    joinDate: "2024-06-01T00:00:00Z",
    primaryApplicationId: "app-003",
  }),
];
