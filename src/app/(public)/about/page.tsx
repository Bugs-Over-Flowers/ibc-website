import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";
import AboutBoard from "./_components/AboutBoard";
import AboutCTA from "./_components/AboutCTA";
import AboutGoals from "./_components/AboutGoals";
import { AboutHero } from "./_components/AboutHero";
import AboutStory from "./_components/AboutStory";
import AboutThrusts from "./_components/AboutThrusts";
import AboutVisionMission from "./_components/AboutVisionMission";

async function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <AboutHero />
      <AboutStory />
      <AboutVisionMission />
      <AboutGoals />
      <AboutThrusts />
      <AboutBoard />
      <AboutCTA />
      <Footer />
    </main>
  );
}

export default AboutPage;
