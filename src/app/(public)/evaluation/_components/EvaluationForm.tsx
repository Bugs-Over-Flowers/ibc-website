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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import { fadeInUp } from "@/lib/animations/fade";
import { EVALUATION_QUESTIONS } from "@/lib/evaluation/evaluationQuestions";
import { formatDate, formatTime } from "@/lib/events/eventUtils";
import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { zodValidator } from "@/lib/utils";
import { EvaluationFormSchema } from "@/lib/validation/evaluation/evaluation-form";
import { submitEvaluationForm } from "@/server/evaluation/actions/submitEvaluation";

interface EvaluationFormProps {
  eventId: string;
  eventData: Database["public"]["Tables"]["Event"]["Row"] | null;
}

export function EvaluationForm({ eventId, eventData }: EvaluationFormProps) {
  const router = useRouter();
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const TOTAL_QUESTIONS = EVALUATION_QUESTIONS.length;

  const form = useAppForm({
    defaultValues: {
      eventId,
      name: "",
      q1Rating: "" as const,
      q2Rating: "" as const,
      q3Rating: "" as const,
      q4Rating: "" as const,
      q5Rating: "" as const,
      q6Rating: "" as const,
      additionalComments: "",
      feedback: "",
    },
    validators: {
      onSubmit: zodValidator(EvaluationFormSchema),
    },
    onSubmit: async ({ value }) => {
      const completedQuestions = EVALUATION_QUESTIONS.filter(
        (q) => value[q.field as keyof typeof value] !== "",
      ).length;

      if (completedQuestions < TOTAL_QUESTIONS) {
        setShowValidationErrors(true);
        toast.error(
          `Please complete all rating questions (${completedQuestions}/${TOTAL_QUESTIONS})`,
        );
        return undefined;
      }

      const { error } = await tryCatch(submitEvaluationForm(value));

      if (error) {
        const message =
          typeof error === "string" ? error : "Failed to submit form";
        toast.error("Failed to submit feedback. Please try again.");
        return undefined;
      }

      toast.success("Thank you! Your feedback has been submitted.");
      router.push("/events");
      return undefined;
    },
  });

  let dateDisplay: string | null = null;
  let timeDisplay: string | null = null;
  if (eventData) {
    const hasStartDate = Boolean(eventData.eventStartDate);
    const hasEndDate = Boolean(eventData.eventEndDate);
    if (hasStartDate && hasEndDate) {
      const startFormatted = formatDate(eventData.eventStartDate as string);
      const endFormatted = formatDate(eventData.eventEndDate as string);
      dateDisplay =
        startFormatted === endFormatted
          ? startFormatted
          : `${startFormatted} – ${endFormatted}`;
    } else if (hasStartDate) {
      dateDisplay = formatDate(eventData.eventStartDate as string);
    } else if (hasEndDate) {
      dateDisplay = formatDate(eventData.eventEndDate as string);
    }
    if (eventData.eventStartDate || eventData.eventEndDate) {
      timeDisplay = formatTime(
        eventData.eventStartDate as string,
        eventData.eventEndDate as string,
      );
    }
  }

  return (
    <form
      className="mx-auto w-full max-w-4xl space-y-3 px-3 sm:space-y-4 sm:px-4 md:space-y-5 md:px-6 lg:space-y-6 lg:px-8"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {/* Event Details Card */}
      {eventData && (
        <motion.div
          className="rounded-lg border border-border bg-linear-to-br from-primary/5 to-transparent p-3 sm:rounded-lg sm:p-4 md:rounded-xl md:p-5 lg:rounded-xl lg:p-6"
          variants={fadeInUp}
        >
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <div>
              <p className="font-medium text-muted-foreground text-xs sm:text-sm">
                Event Evaluation
              </p>
              <h1 className="mt-1 font-bold text-foreground text-xl sm:mt-2 sm:text-2xl md:text-3xl">
                {eventData.eventTitle}
              </h1>
            </div>
            <div className="space-y-1.5 pt-1 sm:space-y-2 sm:pt-2 md:space-y-3">
              {dateDisplay && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <CalendarDays className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                  <span className="font-medium text-foreground text-xs sm:text-sm">
                    {dateDisplay}
                  </span>
                </div>
              )}
              {timeDisplay && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                  <span className="font-medium text-foreground text-xs sm:text-sm">
                    {timeDisplay}
                  </span>
                </div>
              )}
              {eventData.venue && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5 lg:mt-0.5" />
                  <span className="font-medium text-foreground text-xs sm:text-sm">
                    {eventData.venue}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Personal Information Section */}
      <section className="rounded-lg border border-border bg-card p-3 sm:rounded-lg sm:p-4 md:rounded-xl md:p-5 lg:rounded-xl lg:p-6">
        <div className="mb-3 flex items-start gap-2 sm:mb-4 md:mb-5 lg:mb-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-9 sm:w-9 md:h-10 md:w-10">
            <User className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-foreground text-sm sm:text-base">
              Your Information
            </h2>
            <p className="text-muted-foreground text-xs">
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
      <section className="rounded-lg border border-border bg-card p-3 sm:rounded-lg sm:p-4 md:rounded-xl md:p-5 lg:rounded-xl lg:p-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:mb-5 sm:gap-3 md:mb-6 lg:mb-8 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-9 sm:w-9 md:h-10 md:w-10">
              <Star className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-foreground text-sm sm:text-base">
                Rate Your Experience
              </h2>
              <p className="text-muted-foreground text-xs">
                Rate each aspect from Poor to Excellent
              </p>
            </div>
          </div>
          <form.Subscribe
            selector={(state) =>
              EVALUATION_QUESTIONS.filter(
                (q) =>
                  state.values[q.field as keyof typeof state.values] !== "",
              ).length
            }
          >
            {(completedQuestions) => (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <div className="whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-0.5 text-center sm:px-3 sm:py-1">
                  <p className="font-semibold text-primary text-xs sm:text-sm">
                    {completedQuestions}/{TOTAL_QUESTIONS}
                  </p>
                </div>
                {showValidationErrors &&
                  completedQuestions < TOTAL_QUESTIONS && (
                    <div className="whitespace-nowrap rounded-full bg-red-100 px-2.5 py-0.5 text-center sm:px-3 sm:py-1 dark:bg-red-950">
                      <p className="font-semibold text-red-600 text-xs sm:text-sm dark:text-red-400">
                        {TOTAL_QUESTIONS - completedQuestions} missing
                      </p>
                    </div>
                  )}
              </div>
            )}
          </form.Subscribe>
        </div>

        <div className="divide-y divide-border">
          {EVALUATION_QUESTIONS.map((q) => (
            <div
              className="py-3 first:pt-0 last:pb-0 sm:py-4 md:py-5 lg:py-6"
              key={q.field}
            >
              <form.AppField name={q.field}>
                {(field) => <field.RatingScale label={q.question} />}
              </form.AppField>
            </div>
          ))}
        </div>
      </section>

      {/* Comments & Suggestions Section */}
      <section className="rounded-lg border border-border bg-card p-3 sm:rounded-lg sm:p-4 md:rounded-xl md:p-5 lg:rounded-xl lg:p-6">
        <div className="mb-3 flex items-start gap-2 sm:mb-4 md:mb-5 lg:mb-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-9 sm:w-9 md:h-10 md:w-10">
            <MessageSquare className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-foreground text-sm sm:text-base">
              Additional Feedback
            </h2>
            <p className="text-muted-foreground text-xs">
              Share your thoughts and suggestions
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          <form.AppField name="additionalComments">
            {(field) => {
              const max = 500;
              const length = field.state.value?.length || 0;
              return (
                <div className="space-y-1 sm:space-y-1.5">
                  <field.TextareaField
                    className="min-h-20 resize-none sm:min-h-24 md:min-h-28"
                    label="Comments"
                    placeholder="Share any additional thoughts about the event..."
                    textareaProps={{
                      maxLength: 500,
                    }}
                  />
                  <div className="flex justify-end text-muted-foreground text-xs">
                    {length}/{max} characters
                  </div>
                </div>
              );
            }}
          </form.AppField>

          <form.AppField name="feedback">
            {(field) => {
              const max = 500;
              const length = field.state.value?.length || 0;
              return (
                <div className="space-y-1 sm:space-y-1.5">
                  <field.TextareaField
                    className="min-h-20 resize-none sm:min-h-24 md:min-h-28"
                    label="Suggestions for Improvement"
                    placeholder="How can we make our events even better?"
                    textareaProps={{
                      maxLength: 500,
                    }}
                  />
                  <div className="flex justify-end text-muted-foreground text-xs">
                    {length}/{max} characters
                  </div>
                </div>
              );
            }}
          </form.AppField>
        </div>
      </section>

      {/* Submit Button */}
      <div className="pt-2 sm:pt-3 md:pt-4 lg:pt-6">
        <form.AppForm>
          <form.SubmitButton
            className="w-full rounded-lg bg-primary px-3 py-2.5 font-semibold text-white text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 hover:shadow-primary/25 hover:shadow-xl sm:rounded-lg sm:px-4 sm:py-3 sm:text-sm md:rounded-xl md:px-5 md:py-3 md:text-base"
            isSubmittingLabel="Submitting Your Evaluation..."
            label="Submit Evaluation"
          />
        </form.AppForm>
      </div>
    </form>
  );
}
