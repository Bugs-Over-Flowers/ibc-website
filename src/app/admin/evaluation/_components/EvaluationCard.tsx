"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  MessageSquare,
  Star,
  User,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { getEvaluationRatingQuestions } from "@/lib/evaluation/evaluationQuestions";
import { renderStars } from "@/lib/evaluation/ratingStarsClient";
import {
  calculateOverallRating,
  RATING_SCALE,
} from "@/lib/evaluation/ratingUtils";
import { formatEventDateRange } from "@/lib/events/eventUtils";
import type { EvaluationWithEventRpc } from "@/server/evaluation/queries/getEvaluationbyId";

interface EvaluationCardProps {
  evaluation: EvaluationWithEventRpc;
}

export function EvaluationCard({ evaluation }: EvaluationCardProps) {
  const router = useRouter();
  const eventTitle = evaluation.event_title || "Unknown Event";
  const createdAt = new Date(evaluation.created_at);
  const ratings = getEvaluationRatingQuestions(evaluation);
  const ratingValues = ratings.map((r) => r.value);
  const overallRating = calculateOverallRating(ratingValues);

  const handleClick = () => {
    router.push("/admin/evaluation" as Route);
  };

  return (
    <form className="mx-auto max-w-full space-y-6">
      <button
        className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
        onClick={() => handleClick()}
        type="button"
      >
        <ChevronLeft className="h-5 w-5" />
        Back to Evaluations
      </button>

      {/* Event Details Card */}
      <div className="rounded-xl border border-border bg-linear-to-br from-primary/5 to-transparent p-6 sm:p-8">
        <div className="space-y-4">
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              Event Evaluation
            </p>
            <h1 className="mt-2 font-bold text-2xl text-foreground sm:text-3xl">
              {eventTitle}
            </h1>
          </div>

          <div className="space-y-3 pt-2">
            {(() => {
              const dateDisplay = formatEventDateRange(
                evaluation.event_start_date,
                evaluation.event_end_date,
              );
              return dateDisplay ? (
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
                  <span className="font-medium text-foreground text-sm">
                    {dateDisplay}
                  </span>
                </div>
              ) : null;
            })()}
            <div className="flex items-center gap-3 text-muted-foreground">
              <User className="h-5 w-5 shrink-0 text-primary" />
              <span className="font-medium text-foreground text-sm">
                Submitted by: {evaluation.name || "Anonymous"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5 shrink-0 text-primary" />
              <span className="font-medium text-foreground text-sm">
                {format(createdAt, "MMM d, yyyy, h:mm a")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-foreground">
              Event Ratings
            </h2>
            <p className="text-muted-foreground text-sm">
              Respondent's feedback on your event
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {ratings.map((rating) => (
            <div className="py-6 first:pt-0 last:pb-0" key={rating.question}>
              <h3 className="mb-3 font-semibold text-foreground text-sm">
                {rating.question}
              </h3>
              {rating.value ? (
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm">Rating:</span>
                  <div className="flex items-center gap-1">
                    {renderStars(RATING_SCALE[rating.value])}
                  </div>
                  <span className="font-medium text-foreground text-sm">
                    ({RATING_SCALE[rating.value]}/5)
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Not Rated</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Feedback Section */}
      {(evaluation.additional_comments || evaluation.feedback) && (
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
                Respondent's thoughts and suggestions
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {evaluation.additional_comments && (
              <div>
                <h3 className="mb-2 font-medium text-foreground text-sm">
                  Comments
                </h3>
                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="whitespace-pre-wrap font-semibold text-foreground text-sm">
                    {evaluation.additional_comments}
                  </p>
                </div>
              </div>
            )}

            {evaluation.feedback && (
              <div>
                <h3 className="mb-2 font-medium text-foreground text-sm">
                  Suggestions for Improvement
                </h3>
                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="whitespace-pre-wrap font-semibold text-foreground text-sm">
                    {evaluation.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Overall Rating Section */}
      {overallRating && (
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-foreground">
                Overall Rating
              </h2>
              <p className="text-muted-foreground text-sm">
                Average of all ratings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {renderStars(overallRating)}
            </div>
            <span className="font-bold text-foreground text-xl">
              {overallRating}/5
            </span>
          </div>
        </section>
      )}
    </form>
  );
}
