import type { Metadata } from "next";
import { Suspense } from "react";
import CreateSectorForm from "./_components/CreateSectorForm";

export const metadata: Metadata = {
  title: "Create Sector | Admin",
  description: "Create a new business sector classification.",
};

export default function createSectorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateSectorForm />
    </Suspense>
  );
}
