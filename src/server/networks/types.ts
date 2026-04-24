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
    locationType: row.location_type,
    representativeName: row.representative_name,
    representativePosition: row.representative_position,
    logoUrl: row.logo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
