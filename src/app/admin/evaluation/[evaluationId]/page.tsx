import type { Metadata } from "next";
import { Suspense } from "react";
import { EvaluationDetails } from "../_components/EvaluationDetails";
import EvaluationDetailSkeleton from "./loading";

export const metadata: Metadata = {
  title: "Evaluation Details | Admin",
  description: "View detailed event evaluation responses.",
};

interface EvaluationDetailPageProps {
  params: Promise<{ evaluationId: string }>;
}

export default async function EvaluationDetailPage({
  params,
}: EvaluationDetailPageProps) {
  const { evaluationId } = await params;

  return (
    <Suspense fallback={<EvaluationDetailSkeleton />}>
      <EvaluationDetails evaluationId={evaluationId} />
    </Suspense>
  );
}
