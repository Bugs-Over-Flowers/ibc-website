import { z } from "zod";

export const websiteContentSectionSchema = z.enum([
  "vision_mission",
  "goals",
  "company_thrusts",
  "board_of_trustees",
  "secretariat",
  "landing_page_benefits",
]);

export const websiteContentFormSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  paragraph: z.string(),
  visionParagraph: z.string(),
  missionParagraph: z.string(),
  icon: z.string(),
  imageUrl: z.string(),
  cardPlacement: z.string(),
});

export const websiteContentCardSchema = z.object({
  entryKey: z.string(),
  title: z.string(),
  subtitle: z.string(),
  paragraph: z.string(),
  icon: z.string(),
  imageUrl: z.string(),
  cardPlacement: z.string(),
  group: z.string().nullable(),
});

export const saveWebsiteContentSectionSchema = z.object({
  section: websiteContentSectionSchema,
  form: websiteContentFormSchema,
  cards: z.array(websiteContentCardSchema),
});
