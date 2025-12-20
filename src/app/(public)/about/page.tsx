import { AboutBoard } from "./_components/AboutBoard";
import { AboutGoals } from "./_components/AboutGoals";
import { AboutHero } from "./_components/AboutHero";
import AboutStory from "./_components/AboutStory";
import { AboutThrusts } from "./_components/AboutThrusts";
import { AboutVisionMission } from "./_components/AboutVisionMission";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <AboutHero />
      <AboutStory />
      <AboutVisionMission />
      <AboutGoals />
      <AboutThrusts />
      <AboutBoard />
    </main>
  );
}
