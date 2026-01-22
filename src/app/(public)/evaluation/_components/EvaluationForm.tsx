"use client";

import {
  CalendarDays,
  Clock,
  MapPin,
  MessageSquare,
  Star,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import { fadeInUp } from "@/lib/animations/fade";
import { EVALUATION_QUESTIONS } from "@/lib/evaluation/evaluationQuestions";
import { formatDate, formatTime } from "@/lib/events/eventUtils";
import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { EvaluationFormSchema } from "@/lib/validation/evaluation/evaluation-form";
import { submitEvaluationForm } from "@/server/evaluation/actions/submitEvaluation";

interface EvaluationFormProps {
  eventId: string;
  eventData: Database["public"]["Tables"]["Event"]["Row"] | null;
}

export function EvaluationForm({ eventId, eventData }: EvaluationFormProps) {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      eventId,
      name: "",
      q1Rating: undefined as string | undefined,
      q2Rating: undefined as string | undefined,
      q3Rating: undefined as string | undefined,
      q4Rating: undefined as string | undefined,
      q5Rating: undefined as string | undefined,
      q6Rating: undefined as string | undefined,
      additionalComments: "",
      feedback: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const validated = EvaluationFormSchema.parse(value);
        const { error } = await tryCatch(submitEvaluationForm(validated));

        if (error) {
          const message =
            typeof error === "string" ? error : "Failed to submit form";
          toast.error("Failed to submit feedback. Please try again.");
          return {
            onSubmit: [
              {
                message,
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

  useEffect(() => {
    form.reset();
  }, [form]);

  return (
    <form
      className="mx-auto max-w-4xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {/* Event Details Card */}
      {eventData && (
        <motion.div
          className="rounded-xl border border-border bg-linear-to-br from-primary/5 to-transparent p-6 sm:p-8"
          variants={fadeInUp}
        >
          <div className="space-y-4">
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Event Evaluation
              </p>
              <h1 className="mt-2 font-bold text-2xl text-foreground sm:text-3xl">
                {eventData.eventTitle}
              </h1>
            </div>

            <div className="space-y-3 pt-2">
              {(() => {
                const hasStartDate = Boolean(eventData.eventStartDate);
                const hasEndDate = Boolean(eventData.eventEndDate);
                let dateDisplay: string | null = null;
                if (hasStartDate && hasEndDate) {
                  const startFormatted = formatDate(
                    eventData.eventStartDate as string,
                  );
                  const endFormatted = formatDate(
                    eventData.eventEndDate as string,
                  );
                  dateDisplay =
                    startFormatted === endFormatted
                      ? startFormatted
                      : `${startFormatted} – ${endFormatted}`;
                } else if (hasStartDate) {
                  dateDisplay = formatDate(eventData.eventStartDate as string);
                } else if (hasEndDate) {
                  dateDisplay = formatDate(eventData.eventEndDate as string);
                }
                const timeDisplay =
                  eventData.eventStartDate || eventData.eventEndDate
                    ? formatTime(
                        eventData.eventStartDate as string,
                        eventData.eventEndDate as string,
                      )
                    : null;
                return (
                  <>
                    {dateDisplay && (
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
                        <span className="font-medium text-foreground text-sm">
                          {dateDisplay}
                        </span>
                      </div>
                    )}
                    {timeDisplay && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 shrink-0 text-primary" />
                        <span className="font-medium text-foreground text-sm">
                          {timeDisplay}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
              {eventData.venue && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <span className="font-medium text-foreground text-sm">
                    {eventData.venue}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Personal Information Section */}
      <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-foreground">
              Your Information
            </h2>
            <p className="text-muted-foreground text-sm">
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
      <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-foreground">
              Rate Your Experience
            </h2>
            <p className="text-muted-foreground text-sm">
              Rate each aspect from Poor to Excellent
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {EVALUATION_QUESTIONS.map((q) => (
            <div className="py-6 first:pt-0 last:pb-0" key={q.field}>
              <form.AppField name={q.field}>
                {(field) => <field.RatingScale label={q.question} />}
              </form.AppField>
            </div>
          ))}
        </div>
      </section>

      {/* Comments & Suggestions Section */}
      <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-foreground">
              Additional Feedback
            </h2>
            <p className="text-muted-foreground text-sm">
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
      <div className="pt-4">
        <form.AppForm>
          <form.SubmitButton
            className="rounded-xl bg-primary px-6 font-semibold text-md shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 hover:shadow-primary/25 hover:shadow-xl"
            isSubmittingLabel="Submitting Your Evaluation..."
            label="Submit Evaluation"
          />
        </form.AppForm>
      </div>
    </form>
  );
}
