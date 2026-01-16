alter table "public"."Event" alter column "eventEndDate" set data type timestamp with time zone using "eventEndDate"::timestamp with time zone;

alter table "public"."Event" alter column "eventStartDate" set data type timestamp with time zone using "eventStartDate"::timestamp with time zone;


