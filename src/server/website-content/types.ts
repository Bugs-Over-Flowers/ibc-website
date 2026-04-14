export type WebsiteContentSection =
  | "vision_mission"
  | "goals"
  | "company_thrusts"
  | "board_of_trustees"
  | "secretariat"
  | "landing_page_benefits";

export interface WebsiteContentFormState {
  title: string;
  subtitle: string;
  paragraph: string;
  visionParagraph: string;
  missionParagraph: string;
  icon: string;
  imageUrl: string;
  cardPlacement: string;
}

export interface WebsiteContentCardState {
  entryKey: string;
  title: string;
  subtitle: string;
  paragraph: string;
  icon: string;
  imageUrl: string;
  cardPlacement: string;
  group: string | null;
}

export interface WebsiteContentSectionData {
  form: WebsiteContentFormState;
  cards: WebsiteContentCardState[];
  placeholders: WebsiteContentFormState;
  updatedAt: string | null;
}

export type WebsiteContentRow = {
  section: WebsiteContentSection;
  entryKey: string;
  textType: "Paragraph" | "Title" | "Subtitle";
  textValue: string | null;
  icon: string | null;
  imageUrl: string | null;
  cardPlacement: number | null;
  updatedAt: string;
};

export interface SaveWebsiteContentSectionInput {
  section: WebsiteContentSection;
  form: WebsiteContentFormState;
  cards: WebsiteContentCardState[];
}

export interface UpsertWebsiteContentRowInput {
  section: WebsiteContentSection;
  entryKey: string;
  textType: "Paragraph" | "Title" | "Subtitle";
  textValue?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  cardPlacement?: number | null;
}

export const emptyWebsiteContentForm: WebsiteContentFormState = {
  title: "",
  subtitle: "",
  paragraph: "",
  visionParagraph: "",
  missionParagraph: "",
  icon: "",
  imageUrl: "",
  cardPlacement: "",
};

export const emptyWebsiteContentCard: WebsiteContentCardState = {
  entryKey: "",
  title: "",
  subtitle: "",
  paragraph: "",
  icon: "",
  imageUrl: "",
  cardPlacement: "",
  group: null,
};
