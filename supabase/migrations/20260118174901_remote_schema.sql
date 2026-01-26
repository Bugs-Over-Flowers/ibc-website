create type "public"."ratingScale" as enum ('poor', 'fair', 'good', 'veryGood', 'excellent');
create table "public"."EvaluationForm" (
    "evaluationId" uuid not null default gen_random_uuid(),
    "eventId" uuid not null,
    "name" text,
    "q1Rating" integer,
    "q2Rating" integer,
    "q3Rating" integer,
    "q4Rating" integer,
    "q5Rating" integer,
    "additionalComments" text,
    "feedback" text,
    "createdAt" timestamp with time zone default now(),
    "q6Rating" integer
      );


alter table "public"."EvaluationForm" enable row level security;

CREATE UNIQUE INDEX feedback_pkey ON public."EvaluationForm" USING btree ("evaluationId");

alter table "public"."EvaluationForm" add constraint "feedback_pkey" PRIMARY KEY using index "feedback_pkey";

alter table "public"."EvaluationForm" add constraint "EvaluationForm_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"("eventId") ON DELETE CASCADE not valid;

alter table "public"."EvaluationForm" validate constraint "EvaluationForm_eventId_fkey";

alter table "public"."EvaluationForm" add constraint "EvaluationForm_q1Rating_check" CHECK ((("q1Rating" >= 1) AND ("q1Rating" <= 5))) not valid;

alter table "public"."EvaluationForm" validate constraint "EvaluationForm_q1Rating_check";

alter table "public"."EvaluationForm" add constraint "EvaluationForm_q2Rating_check" CHECK ((("q2Rating" >= 1) AND ("q2Rating" <= 5))) not valid;

alter table "public"."EvaluationForm" validate constraint "EvaluationForm_q2Rating_check";

alter table "public"."EvaluationForm" add constraint "EvaluationForm_q3Rating_check" CHECK ((("q3Rating" >= 1) AND ("q3Rating" <= 5))) not valid;

alter table "public"."EvaluationForm" validate constraint "EvaluationForm_q3Rating_check";

alter table "public"."EvaluationForm" add constraint "EvaluationForm_q4Rating_check" CHECK ((("q4Rating" >= 1) AND ("q4Rating" <= 5))) not valid;

alter table "public"."EvaluationForm" validate constraint "EvaluationForm_q4Rating_check";

alter table "public"."EvaluationForm" add constraint "EvaluationForm_q5Rating_check" CHECK ((("q5Rating" >= 1) AND ("q5Rating" <= 5))) not valid;

alter table "public"."EvaluationForm" validate constraint "EvaluationForm_q5Rating_check";

grant delete on table "public"."EvaluationForm" to "anon";

grant insert on table "public"."EvaluationForm" to "anon";

grant references on table "public"."EvaluationForm" to "anon";

grant select on table "public"."EvaluationForm" to "anon";

grant trigger on table "public"."EvaluationForm" to "anon";

grant truncate on table "public"."EvaluationForm" to "anon";

grant update on table "public"."EvaluationForm" to "anon";

grant delete on table "public"."EvaluationForm" to "authenticated";

grant insert on table "public"."EvaluationForm" to "authenticated";

grant references on table "public"."EvaluationForm" to "authenticated";

grant select on table "public"."EvaluationForm" to "authenticated";

grant trigger on table "public"."EvaluationForm" to "authenticated";

grant truncate on table "public"."EvaluationForm" to "authenticated";

grant update on table "public"."EvaluationForm" to "authenticated";

grant delete on table "public"."EvaluationForm" to "service_role";

grant insert on table "public"."EvaluationForm" to "service_role";

grant references on table "public"."EvaluationForm" to "service_role";

grant select on table "public"."EvaluationForm" to "service_role";

grant trigger on table "public"."EvaluationForm" to "service_role";

grant truncate on table "public"."EvaluationForm" to "service_role";

grant update on table "public"."EvaluationForm" to "service_role";


  create policy "Allow all operations for anyone 11d98ol_0"
  on "storage"."objects"
  as permissive
  for insert
  to anon, authenticated
with check ((bucket_id = 'paymentproofs'::text));



  create policy "Allow all operations for anyone 11d98ol_1"
  on "storage"."objects"
  as permissive
  for select
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));



  create policy "Allow all operations for anyone 11d98ol_2"
  on "storage"."objects"
  as permissive
  for delete
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));



  create policy "Allow all operations for anyone 11d98ol_3"
  on "storage"."objects"
  as permissive
  for update
  to anon, authenticated
using ((bucket_id = 'paymentproofs'::text));
