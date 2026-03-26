CREATE OR REPLACE FUNCTION "public"."get_evaluations_by_event"(
  "event_id" uuid,
  "completed_only" boolean DEFAULT false
) RETURNS TABLE(
  "evaluation_id" "uuid",
  "event_id" "uuid",
  "event_title" "text",
  "event_start_date" timestamp with time zone,
  "event_end_date" timestamp with time zone,
  "venue" "text",
  "name" "text",
  "q1_rating" "public"."ratingScale",
  "q2_rating" "public"."ratingScale",
  "q3_rating" "public"."ratingScale",
  "q4_rating" "public"."ratingScale",
  "q5_rating" "public"."ratingScale",
  "q6_rating" "public"."ratingScale",
  "additional_comments" "text",
  "feedback" "text",
  "created_at" timestamp with time zone
)
    LANGUAGE "sql" STABLE
    AS $$
  select
    ef."evaluationId" as "evaluation_id",
    e."eventId" as "event_id",
    e."eventTitle" as "event_title",
    e."eventStartDate" as "event_start_date",
    e."eventEndDate" as "event_end_date",
    e."venue" as "venue",
    ef."name" as "name",
    ef."q1Rating" as "q1_rating",
    ef."q2Rating" as "q2_rating",
    ef."q3Rating" as "q3_rating",
    ef."q4Rating" as "q4_rating",
    ef."q5Rating" as "q5_rating",
    ef."q6Rating" as "q6_rating",
    ef."additionalComments" as "additional_comments",
    ef."feedback" as "feedback",
    ef."createdAt" as "created_at"
  from
    "EvaluationForm" ef
    left join "Event" e on ef."eventId" = e."eventId"
  where
    (e."eventId" = "event_id")
    and (
      not "completed_only" or (
        ef."q1Rating" is not null and
        ef."q2Rating" is not null and
        ef."q3Rating" is not null and
        ef."q4Rating" is not null and
        ef."q5Rating" is not null and
        ef."q6Rating" is not null
      )
    )
  order by
    ef."createdAt" desc;
$$;

ALTER FUNCTION "public"."get_evaluations_by_event"(uuid, boolean) OWNER TO "postgres";
GRANT ALL ON FUNCTION "public"."get_evaluations_by_event"(uuid, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_evaluations_by_event"(uuid, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_evaluations_by_event"(uuid, boolean) TO "service_role";
