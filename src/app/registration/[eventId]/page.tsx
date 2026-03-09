import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { RegistrationRouteProps } from "@/lib/types/route";
import { RegistrationPageContent } from "./_components/RegistrationPageContent";

export default function Page({ params, searchParams }: RegistrationRouteProps) {
  return (
    <main className="min-h-screen w-full bg-linear-to-b from-background via-background to-muted/30 pb-20">
      <Suspense fallback={<Spinner />}>
        <RegistrationPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
