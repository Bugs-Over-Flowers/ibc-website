import { Suspense } from "react";
import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedEventsHero } from "./_components/FeaturedEventsHero";

function HeroSkeleton() {
  return <Skeleton className="h-screen min-h-[700px] max-h-[950px] w-full" />;
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
