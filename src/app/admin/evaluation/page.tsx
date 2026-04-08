import type { Metadata } from "next";
import { Suspense } from "react";
import { EvaluationTable } from "./_components/EvaluationTable";
import EvaluationPageSkeleton from "./loading";

export const metadata: Metadata = {
  title: "Evaluations | Admin",
  description: "View and manage event evaluations",
};

export default function EvaluationPage() {
  return (
    <div className="space-y-6 px-2">
      <Suspense fallback={<EvaluationPageSkeleton />}>
        <div>
          <h1 className="font-bold text-3xl text-foreground">Evaluations</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage event evaluations from participants
          </p>
        </div>

        <EvaluationTable />
      </Suspense>
    </div>
  );
}
