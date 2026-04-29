import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getPublicHeroSectionImages,
  getPublicWebsiteContentSection,
} from "@/server/website-content/queries/getPublicWebsiteContentSection";
import { AboutBoard } from "./_components/AboutBoard";
import { AboutGoals } from "./_components/AboutGoals";
import { AboutHero } from "./_components/AboutHero";
import AboutStory from "./_components/AboutStory";
import { AboutThrusts } from "./_components/AboutThrusts";
import { AboutVisionMission } from "./_components/AboutVisionMission";

export const metadata: Metadata = {
  title: "About IBC",
  description:
    "Learn about our vision, mission, leadership board, and strategic initiatives.",
};

export default async function AboutPage() {
  const [
    visionMissionSection,
    goalsSection,
    companyThrustsSection,
    boardSection,
    secretariatSection,
  ] = await Promise.all([
    getPublicWebsiteContentSection("vision_mission"),
    getPublicWebsiteContentSection("goals"),
    getPublicWebsiteContentSection("company_thrusts"),
    getPublicWebsiteContentSection("board_of_trustees"),
    getPublicWebsiteContentSection("secretariat"),
  ]);

  const aboutHeroImages = await getPublicHeroSectionImages("about");

  const goalsData = goalsSection.hasRows
    ? goalsSection.cards.map((card) => ({
        icon: card.icon,
        title: card.title,
        description: card.paragraph,
      }))
    : undefined;

  const thrustsData = companyThrustsSection.hasRows
    ? companyThrustsSection.cards.map((card) => ({
        icon: card.icon,
        title: card.title,
        description: card.paragraph,
      }))
    : undefined;

  const boardCards = boardSection.hasRows
    ? boardSection.cards.map((card) => ({
        title: card.title,
        subtitle: card.subtitle,
        group: card.group,
        imageUrl: card.imageUrl,
      }))
    : undefined;

  const secretariatCards = secretariatSection.hasRows
    ? secretariatSection.cards.map((card) => ({
        title: card.title,
        subtitle: card.subtitle,
        group: card.group,
        imageUrl: card.imageUrl,
      }))
    : undefined;

  return (
    <main className="min-h-screen bg-background">
      <Suspense>
        <AboutHero backgroundImages={aboutHeroImages} />
        <AboutStory />
        <AboutVisionMission
          missionParagraph={
            visionMissionSection.hasRows
              ? visionMissionSection.missionParagraph
              : undefined
          }
          visionParagraph={
            visionMissionSection.hasRows
              ? visionMissionSection.visionParagraph
              : undefined
          }
        />
        <AboutGoals goalsData={goalsData} />
        <AboutThrusts thrustsData={thrustsData} />
        <AboutBoard
          boardCards={boardCards}
          secretariatCards={secretariatCards}
        />
      </Suspense>
    </main>
  );
}
