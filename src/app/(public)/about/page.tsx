import type { Metadata } from "next";
import { Suspense } from "react";
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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense>
        <AboutHero />
        <AboutStory />
        <AboutVisionMission />
        <AboutGoals />
        <AboutThrusts />
        <AboutBoard />
      </Suspense>
    </main>
  );
}
