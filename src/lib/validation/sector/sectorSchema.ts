import { z } from "zod";

export const createSectorSchema = z.object({
  sectorName: z.string().trim().min(1, "Sector name is required"),
});

export const updateSectorSchema = z.object({
  id: z.number(),
  sectorName: z.string().trim().min(1, "Sector name is required"),
});

export type CreateSectorInput = z.infer<typeof createSectorSchema>;
export type UpdateSectorInput = z.infer<typeof updateSectorSchema>;
