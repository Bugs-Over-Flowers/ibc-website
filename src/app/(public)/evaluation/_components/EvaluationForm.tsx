"use client";

import { MessageSquare, Star, User } from "lucide-react";
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

export function EvaluationForm({ eventId }: EvaluationFormProps) {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      eventId,
      name: "",
      q1Rating: "",
      q2Rating: "",
      q3Rating: "",
      q4Rating: "",
      q5Rating: "",
      q6Rating: "",
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
      className="mx-auto max-w-4xl space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {/* Personal Information Section */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-xl">
              Your Information
            </h2>
            <p className="text-base text-muted-foreground">
              Optional - you can remain anonymous
            </p>
          </div>
        </div>

        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label="Name"
              placeholder="Enter your name (optional)"
            />
          )}
        </form.AppField>
      </section>

      {/* Rating Questions Section */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3 lg:mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-xl">
              Rate Your Experience
            </h2>
            <p className="text-base text-muted-foreground">
              Rate each aspect from Poor to Excellent
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {EVALUATION_QUESTIONS.map((q) => (
            <div className="py-5 first:pt-0 last:pb-0 lg:py-6" key={q.field}>
              <form.AppField name={q.field}>
                {(field) => <field.RatingScale label={q.question} />}
              </form.AppField>
            </div>
          ))}
        </div>
      </section>

      {/* Comments & Suggestions Section */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-xl">
              Additional Feedback
            </h2>
            <p className="text-base text-muted-foreground">
              Share your thoughts and suggestions
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <form.AppField name="additionalComments">
            {(field) => (
              <field.TextareaField
                className="min-h-28 resize-none"
                label="Comments"
                placeholder="Share any additional thoughts about the event..."
              />
            )}
          </form.AppField>

          <form.AppField name="feedback">
            {(field) => (
              <field.TextareaField
                className="min-h-28 resize-none"
                label="Suggestions for Improvement"
                placeholder="How can we make our events even better?"
              />
            )}
          </form.AppField>
        </div>
      </section>

      {/* Submit Button */}
      <div className="pt-2">
        <form.AppForm>
          <form.SubmitButton
            className="w-full py-6 font-semibold text-lg sm:py-5"
            isSubmittingLabel="Submitting Your Feedback..."
            label="Submit Feedback"
          />
        </form.AppForm>
      </div>
    </form>
  );
}
