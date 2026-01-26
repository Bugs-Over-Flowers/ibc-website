export interface EvaluationQuestion {
  field:
    | "q1Rating"
    | "q2Rating"
    | "q3Rating"
    | "q4Rating"
    | "q5Rating"
    | "q6Rating";
  question: string;
}

export const EVALUATION_QUESTIONS: EvaluationQuestion[] = [
  {
    field: "q1Rating",
    question: "How would you rate the organization of the event?",
  },
  {
    field: "q2Rating",
    question: "How would you rate the knowledge of the resource speakers?",
  },
  {
    field: "q3Rating",
    question: "How would you rate the relevance of the materials presented?",
  },
  {
    field: "q4Rating",
    question: "How would you rate the facilities and venue?",
  },
  {
    field: "q5Rating",
    question: "How well did the event meet its stated purpose?",
  },
  {
    field: "q6Rating",
    question: "How well did the event meet your expectations?",
  },
];

/**
 * Get evaluation questions as rating display objects
 */
export function getEvaluationRatingQuestions(evaluation: {
  q1_rating?: string | null;
  q2_rating?: string | null;
  q3_rating?: string | null;
  q4_rating?: string | null;
  q5_rating?: string | null;
  q6_rating?: string | null;
}) {
  const ratingFieldMap: Record<string, keyof typeof evaluation> = {
    q1Rating: "q1_rating",
    q2Rating: "q2_rating",
    q3Rating: "q3_rating",
    q4Rating: "q4_rating",
    q5Rating: "q5_rating",
    q6Rating: "q6_rating",
  };

  return EVALUATION_QUESTIONS.map((q) => ({
    question: q.question,
    value: evaluation[ratingFieldMap[q.field]],
  }));
}
