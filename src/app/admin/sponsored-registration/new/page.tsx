import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateSRPageContent } from "./_components/CreateSRPageContent";
import NewSponsoredRegistrationLoading from "./loading";

export const metadata: Metadata = {
  title: "Create Sponsored Registration | Admin",
  description: "Create a new sponsored registration",
};

export default function NewSponsoredRegistrationPage() {
  return (
    <Suspense fallback={<NewSponsoredRegistrationLoading />}>
      <CreateSRPageContent />
    </Suspense>
  );
}
