import type {
  WebsiteContentSection,
  WebsiteContentSectionDefaults,
} from "../types";
import { getBoardOfTrusteesDefaults } from "./getBoardOfTrusteesDefaults";
import { getCompanyThrustsDefaults } from "./getCompanyThrustsDefaults";
import { getGoalsDefaults } from "./getGoalsDefaults";
import { getLandingPageBenefitsDefaults } from "./getLandingPageBenefitsDefaults";
import { getSecretariatDefaults } from "./getSecretariatDefaults";
import { getVisionMissionDefaults } from "./getVisionMissionDefaults";

export function getDefaultsBySection(
  section: WebsiteContentSection,
): WebsiteContentSectionDefaults {
  switch (section) {
    case "vision_mission":
      return getVisionMissionDefaults();
    case "goals":
      return getGoalsDefaults();
    case "company_thrusts":
      return getCompanyThrustsDefaults();
    case "board_of_trustees":
      return getBoardOfTrusteesDefaults();
    case "secretariat":
      return getSecretariatDefaults();
    case "landing_page_benefits":
      return getLandingPageBenefitsDefaults();
    default:
      return getVisionMissionDefaults();
  }
}
