import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Compass,
  Images,
  Landmark,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export type WebsiteContentSectionKey =
  | "vision_mission"
  | "goals"
  | "company_thrusts"
  | "board_of_trustees"
  | "secretariat"
  | "landing_page_benefits"
  | "hero_section";

export type WebsiteContentSection = {
  key: WebsiteContentSectionKey;
  title: string;
  description: string;
  accentClass: string;
  iconClass: string;
  icon: LucideIcon;
  fields?: string;
};

export const websiteContentSections = [
  {
    key: "vision_mission",
    title: "Vision and Mission",
    description: "Paragraph content for organization vision and mission.",
    accentClass: "bg-sky-500",
    iconClass: "bg-sky-50 text-sky-600",
    icon: Compass,
  },
  {
    key: "goals",
    title: "Goals",
    description: "Title, paragraph, and icon setup for goals section cards.",
    accentClass: "bg-emerald-500",
    iconClass: "bg-emerald-50 text-emerald-600",
    icon: Target,
  },
  {
    key: "company_thrusts",
    title: "Company Thrusts",
    description: "Title, paragraph, and icon values for thrust items.",
    accentClass: "bg-amber-500",
    iconClass: "bg-amber-50 text-amber-600",
    icon: Building2,
  },
  {
    key: "board_of_trustees",
    title: "Board of Trustees",
    description: "Manage title, subtitle, image, and optional card placement.",
    accentClass: "bg-rose-500",
    iconClass: "bg-rose-50 text-rose-600",
    icon: Landmark,
  },
  {
    key: "secretariat",
    title: "Secretariat",
    description: "Manage title, subtitle, and image for staff cards.",
    accentClass: "bg-cyan-500",
    iconClass: "bg-cyan-50 text-cyan-600",
    icon: Users,
  },
  {
    key: "landing_page_benefits",
    title: "Landing Page Benefits",
    description: "Set title, paragraph copy, and icon for home benefits.",
    accentClass: "bg-indigo-500",
    iconClass: "bg-indigo-50 text-indigo-600",
    icon: Sparkles,
  },
  {
    key: "hero_section",
    title: "Hero Section Carousel",
    description:
      "Manage 5 background carousel images each for About, Events, Members, Networks, and Contact pages.",
    accentClass: "bg-violet-500",
    iconClass: "bg-violet-50 text-violet-600",
    icon: Images,
    fields: "25 image slots",
  },
] as const satisfies readonly WebsiteContentSection[];
