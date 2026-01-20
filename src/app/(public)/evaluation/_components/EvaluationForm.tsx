"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import { EvaluationFormSchema } from "@/lib/validation/evaluation/evaluation-form";
import { submitEvaluationForm } from "@/server/evaluation/actions/submitEvaluation";

interface EvaluationFormProps {
  eventId: string;
}

interface EvaluationQuestion {
  field:
    | "q1Rating"
    | "q2Rating"
    | "q3Rating"
    | "q4Rating"
    | "q5Rating"
    | "q6Rating";
  question: string;
}

const EVALUATION_QUESTIONS: EvaluationQuestion[] = [
  {
    field: "q1Rating",
    question: "The event was well organized.",
  },
  {
    field: "q2Rating",
    question: "Resource Speakers were knowledgeable.",
  },
  {
    field: "q3Rating",
    question: "Materials presented were relevant and helpful.",
  },
  {
    field: "q4Rating",
    question: "The facilities were appropriate.",
  },
  {
    field: "q5Rating",
    question: "The purpose of the dialogue was met.",
  },
  {
    field: "q6Rating",
    question: "My expectations of the dialogue were met.",
  },
];

export function EvaluationForm({ eventId }: EvaluationFormProps) {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      eventId,
      name: "",
      q1Rating: "good",
      q2Rating: "good",
      q3Rating: "good",
      q4Rating: "good",
      q5Rating: "good",
      q6Rating: "good",
      additionalComments: "",
      feedback: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const validated = EvaluationFormSchema.parse(value);
        const { error } = await tryCatch(submitEvaluationForm(validated));

        if (error) {
          toast.error("Failed to submit feedback. Please try again.");
          return {
            onSubmit: [
              {
                message: error ?? "Failed to submit form",
              },
            ],
          };
        }

        toast.success("Thank you! Your feedback has been submitted.");
        router.push("/events");
        return undefined;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Validation failed";
        return {
          onSubmit: [
            {
              message,
            },
          ],
        };
      }
    },
  });

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Name (Optional)"
            placeholder="Enter your name"
          />
        )}
      </form.AppField>

      {/* Rating Questions */}
      <div className="space-y-6">
        <div>
          <h2 className="mb-6 font-semibold text-foreground text-xl">
            Please rate the following statements
          </h2>
          <p className="text-muted-foreground text-sm">
            Poor = Strongly Disagree | Excellent = Strongly Agree
          </p>
        </div>

        {EVALUATION_QUESTIONS.map((q) => (
          <form.AppField key={q.field} name={q.field}>
            {(field) => <field.RatingScale label={q.question} />}
          </form.AppField>
        ))}
      </div>

      {/* Additional Comments */}
      <form.AppField name="additionalComments">
        {(field) => (
          <field.TextareaField
            className="min-h-24"
            label="Additional comments or feedback"
            placeholder="Share any additional thoughts or comments..."
          />
        )}
      </form.AppField>

      {/* Suggestions */}
      <form.AppField name="feedback">
        {(field) => (
          <field.TextareaField
            className="min-h-24"
            label="Suggestions"
            placeholder="We'd love to hear your suggestions for improvement..."
          />
        )}
      </form.AppField>

      {/* Submit Button */}
      <form.AppForm>
        <form.SubmitButton
          isSubmittingLabel="Submitting..."
          label="Submit Feedback"
        />
      </form.AppForm>
    </form>
  );
}
