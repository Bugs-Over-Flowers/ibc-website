import { Suspense } from "react";
import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";
import { FeaturedEventsHero } from "./components/FeaturedEventsHero";

function HeroSkeleton() {
  return (
    <div className="h-screen min-h-[700px] max-h-[950px] w-full animate-pulse bg-muted" />
  );
}

export default function Page() {
  const handleNavigate = (page: string, params?: { eventId?: string }) => {
    console.log("Navigate to:", page, params);
  };
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<HeroSkeleton />}>
        <FeaturedEventsHero />
      </Suspense>
      <Footer />
    </main>
  );
}
