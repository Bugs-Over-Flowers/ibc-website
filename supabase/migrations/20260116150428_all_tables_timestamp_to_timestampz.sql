alter table "public"."Application" alter column "applicationDate" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."Application" alter column "applicationDate" set data type timestamp with time zone using "applicationDate"::timestamp with time zone;

alter table "public"."BusinessMember" alter column "membershipExpiryDate" set data type timestamp with time zone using "membershipExpiryDate"::timestamp with time zone;

alter table "public"."CheckIn" drop column "date";

alter table "public"."CheckIn" add column "checkInTime" timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text);

alter table "public"."Interview" alter column "createdAt" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."Interview" alter column "createdAt" set data type timestamp with time zone using "createdAt"::timestamp with time zone;

alter table "public"."Interview" alter column "interviewDate" set data type timestamp with time zone using "interviewDate"::timestamp with time zone;

alter table "public"."Interview" alter column "updatedAt" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."Interview" alter column "updatedAt" set data type timestamp with time zone using "updatedAt"::timestamp with time zone;

alter table "public"."Registration" alter column "registrationDate" set default (now() AT TIME ZONE 'utc'::text);

alter table "public"."Registration" alter column "registrationDate" set data type timestamp with time zone using "registrationDate"::timestamp with time zone;


