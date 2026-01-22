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
      className="mx-auto w-full max-w-4xl space-y-4 px-4 sm:space-y-6 sm:px-0"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {/* Event Details Card */}
      {eventData && (
        <motion.div
          className="rounded-lg border border-border bg-linear-to-br from-primary/5 to-transparent p-4 sm:rounded-xl sm:p-6 lg:p-8"
          variants={fadeInUp}
        >
          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                Event Evaluation
              </p>
              <h1 className="mt-2 font-bold text-2xl text-foreground sm:text-3xl">
                {eventData.eventTitle}
              </h1>
            </div>

            <div className="space-y-2 pt-2 sm:space-y-3">
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
      <section className="rounded-lg border border-border bg-card p-4 sm:rounded-xl sm:p-6 lg:p-8">
        <div className="mb-4 flex items-start gap-3 sm:mb-6">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
            <User className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-base text-foreground">
              Your Information
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
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
      <section className="rounded-lg border border-border bg-card p-4 sm:rounded-xl sm:p-6 lg:p-8">
        <div className="mb-6 flex items-start gap-3 sm:mb-8">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
            <Star className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-base text-foreground">
              Rate Your Experience
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Rate each aspect from Poor to Excellent
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {EVALUATION_QUESTIONS.map((q) => (
            <div className="py-4 first:pt-0 last:pb-0 sm:py-6" key={q.field}>
              <form.AppField name={q.field}>
                {(field) => <field.RatingScale label={q.question} />}
              </form.AppField>
            </div>
          ))}
        </div>
      </section>

      {/* Comments & Suggestions Section */}
      <section className="rounded-lg border border-border bg-card p-4 sm:rounded-xl sm:p-6 lg:p-8">
        <div className="mb-4 flex items-start gap-3 sm:mb-6">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
            <MessageSquare className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-base text-foreground">
              Additional Feedback
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Share your thoughts and suggestions
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-5">
          <form.AppField name="additionalComments">
            {(field) => (
              <field.TextareaField
                className="min-h-24 resize-none sm:min-h-28"
                label="Comments"
                placeholder="Share any additional thoughts about the event..."
              />
            )}
          </form.AppField>

          <form.AppField name="feedback">
            {(field) => (
              <field.TextareaField
                className="min-h-24 resize-none sm:min-h-28"
                label="Suggestions for Improvement"
                placeholder="How can we make our events even better?"
              />
            )}
          </form.AppField>
        </div>
      </section>

      {/* Submit Button */}
      <div className="pt-2 sm:pt-4">
        <form.AppForm>
          <form.SubmitButton
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 hover:shadow-primary/25 hover:shadow-xl sm:rounded-xl sm:px-6 sm:text-base"
            isSubmittingLabel="Submitting Your Evaluation..."
            label="Submit Evaluation"
          />
        </form.AppForm>
      </div>
    </form>
  );
}
