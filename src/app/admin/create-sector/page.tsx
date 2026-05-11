import type { Metadata } from "next";
import { Suspense } from "react";
import BackButton from "@/app/admin/_components/BackButton";
import CreateSectorForm from "./_components/CreateSectorForm";
import CreateSectorLoading from "./loading";

export const metadata: Metadata = {
  title: "Create Sector | Admin",
  description: "Create a new business sector classification.",
};

export default function CreateSectorPage() {
  return (
    <div className="pb-8">
      <div className="px-4 pt-8 pb-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <BackButton href="/admin/manage-sector" label="Back to Sectors" />
          </div>

          <h1 className="mb-4 font-extrabold text-4xl text-foreground tracking-tight md:text-5xl">
            Create Sector
          </h1>
          <p className="max-w-2xl font-medium text-foreground/90 text-lg leading-relaxed">
            Add a new sector classification to organize businesses and manage
            industry categories.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<CreateSectorLoading />}>
          <CreateSectorForm />
        </Suspense>
      </div>
    </div>
  );
}
