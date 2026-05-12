import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/db.types";

export type NetworkRow = Tables<"Networks">;
export type NetworkInsert = TablesInsert<"Networks">;
export type NetworkUpdate = TablesUpdate<"Networks">;

export type Network = {
  id: string;
  organization: string;
  about: string;
  locationType: string;
  representativeName: string;
  representativePosition: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export function mapNetworkRow(row: NetworkRow): Network {
  return {
    id: row.id,
    organization: row.organization,
    about: row.about,
    locationType: row.locationType,
    representativeName: row.representativeName,
    representativePosition: row.representativePosition,
    logoUrl: row.logoUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
