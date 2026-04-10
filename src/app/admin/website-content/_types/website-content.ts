export type WebsiteContentSection =
  | "vision_mission"
  | "goals"
  | "company_thrusts"
  | "board_of_trustees"
  | "secretariat"
  | "landing_page_benefits";

export type WebsiteContentTextType = "Paragraph" | "Title" | "Subtitle";

export interface WebsiteContentItem {
  id: string;
  section: WebsiteContentSection;
  entryKey: string;
  textType: WebsiteContentTextType;
  textValue: string | null;
  icon: string | null;
  imageUrl: string | null;
  cardPlacement: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteContentSectionConfig {
  section: WebsiteContentSection;
  label: string;
  supportsIcon: boolean;
  supportsImage: boolean;
  supportsCardPlacement: boolean;
}

export const WEBSITE_CONTENT_SECTIONS: WebsiteContentSectionConfig[] = [
  {
    section: "vision_mission",
    label: "Vision and Mission",
    supportsIcon: false,
    supportsImage: false,
    supportsCardPlacement: false,
  },
  {
    section: "goals",
    label: "Goals",
    supportsIcon: true,
    supportsImage: false,
    supportsCardPlacement: true,
  },
  {
    section: "company_thrusts",
    label: "Company Thrusts",
    supportsIcon: true,
    supportsImage: false,
    supportsCardPlacement: true,
  },
  {
    section: "board_of_trustees",
    label: "Board of Trustees",
    supportsIcon: false,
    supportsImage: true,
    supportsCardPlacement: true,
  },
  {
    section: "secretariat",
    label: "Secretariat",
    supportsIcon: false,
    supportsImage: true,
    supportsCardPlacement: true,
  },
  {
    section: "landing_page_benefits",
    label: "Landing Page Benefits",
    supportsIcon: true,
    supportsImage: false,
    supportsCardPlacement: true,
  },
];
