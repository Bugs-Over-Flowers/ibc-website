import { Suspense } from "react";
import { EvaluationTable } from "./_components/EvaluationTable";
import EvaluationPageSkeleton from "./loading";

export const metadata = {
  title: "Evaluations | Admin",
  description: "View and manage event evaluations",
};

export default function EvaluationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl text-foreground">Evaluations</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage event evaluations from participants
        </p>
      </div>

      <Suspense fallback={<EvaluationPageSkeleton />}>
        <EvaluationTable />
      </Suspense>
    </div>
  );
}
