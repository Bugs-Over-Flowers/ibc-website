import { createE2EAdminClient } from "../helpers/supabase";

interface SectorRow {
  sectorId: number;
  sectorName: string;
}

export interface SeededSectorScenario {
  seedKey: string;
  primarySector: SectorRow;
  secondarySector: SectorRow;
  createdSectorName: string;
  renamedSectorName: string;
  nonExistentSearch: string;
}

export async function seedSectorScenario(): Promise<SeededSectorScenario> {
  const supabase = createE2EAdminClient();
  const seedKey = `e2e-sector-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const primarySectorName = `${seedKey}-primary`;
  const secondarySectorName = `${seedKey}-secondary`;

  const { data, error } = await supabase
    .from("Sector")
    .insert([
      { sectorName: primarySectorName },
      { sectorName: secondarySectorName },
    ])
    .select("sectorId, sectorName");

  if (error || !data || data.length < 2) {
    throw new Error(error?.message ?? "Failed to seed sectors");
  }

  const primarySector = data.find(
    (row) => row.sectorName === primarySectorName,
  );
  const secondarySector = data.find(
    (row) => row.sectorName === secondarySectorName,
  );

  if (!primarySector || !secondarySector) {
    throw new Error("Seeded sectors were not returned by the database");
  }

  return {
    seedKey,
    primarySector,
    secondarySector,
    createdSectorName: `${seedKey}-created`,
    renamedSectorName: `${seedKey}-renamed-primary`,
    nonExistentSearch: `${seedKey}-no-match`,
  };
}

export async function cleanupSectorScenario(
  scenario: SeededSectorScenario,
): Promise<void> {
  const supabase = createE2EAdminClient();

  const { error } = await supabase
    .from("Sector")
    .delete()
    .ilike("sectorName", `${scenario.seedKey}%`);

  if (error) {
    throw new Error(`Failed to cleanup seeded sectors: ${error.message}`);
  }
}
