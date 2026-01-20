import { formatDate } from "date-fns";
import {
  CalendarDays,
  CheckCircle,
  CreditCard,
  QrCode,
  User,
  Users,
} from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationInformationPageProps } from "@/lib/types/route";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import NotReadyEvent from "../../_components/NotReadyEvent";
import RegistrationErrorComponent from "../../_components/RegistrationErrorComponent";

export default async function RegistrationInfoPage({
  params,
}: {
  params: RegistrationInformationPageProps["params"];
}) {
  const { eventId } = await params;
  const requestCookies = (await cookies()).getAll();
  const {
    error: registrationEventDetailsMessage,
    data,
    success,
  } = await tryCatch(getRegistrationEventDetails(requestCookies, { eventId }));

  if (!success) {
    return (
      <RegistrationErrorComponent message={registrationEventDetailsMessage} />
    );
  }

  if (data.eventType === null) {
    return <NotReadyEvent title={data.eventTitle} />;
  }

  if (!data.eventStartDate || !data.eventEndDate) {
    return <div>Error loading event.</div>;
  }

  const formattedStartDate = formatDate(
    new Date(data.eventStartDate),
    "dd MMM yyyy",
  );
  const formattedEndDate = formatDate(
    new Date(data.eventEndDate),
    "dd MMM yyyy",
  );

  const dateDisplay =
    formattedStartDate === formattedEndDate
      ? formattedStartDate
      : `${formattedStartDate} - ${formattedEndDate}`;

  const steps = [
    {
      icon: User,
      title: "Step 1: Your Details",
      description: "Input your personal details and membership status.",
    },
    {
      icon: Users,
      title: "Step 2: Participants",
      description:
        "Register up to 10 people (including yourself) in a single transaction.",
    },
    {
      icon: CreditCard,
      title: "Step 3: Payment",
      description: (
        <>
          Pay via <strong>BPI / ONLINE</strong> or <strong>ONSITE</strong>.
          Online payments require uploading a proof of payment for verification.
        </>
      ),
    },
    {
      icon: CheckCircle,
      title: "Step 4: Confirmation",
      description:
        "Review your information to ensure all details are correct before submitting.",
    },
    {
      icon: QrCode,
      title: "Step 5: Get QR Code",
      description:
        "Receive your QR code instantly on the success page and via email.",
    },
  ];

  return (
    <div className="p-10">
      <Card>
        <CardHeader>
          <Link href={`/events/${eventId}`}>
            <Button>Back to Event</Button>
          </Link>
          {data.eventHeaderUrl && (
            <div className="relative h-96 overflow-hidden rounded-md">
              <Image
                alt={data.eventTitle}
                className="object-cover"
                fill
                src={data.eventHeaderUrl}
              />
            </div>
          )}
          <CardTitle className="pt-3 text-xl">{data.eventTitle}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <CalendarDays />
            {dateDisplay}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-2">
          <div>{data.description}</div>
        </CardContent>
        <Separator />
        <CardContent>
          <h3>Registration Steps</h3>

          <div className="grid gap-4 py-5 md:grid md:grid-flow-col md:grid-rows-3">
            {steps.map((step, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Just for rendering static items
              <div className="flex gap-4" key={index}>
                <div className="flex-none">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm leading-none">
                    {step.title}
                  </h4>
                  <div className="text-muted-foreground text-sm">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <TermsAndConditions
            triggerOverride={
              <Button className="px-0 text-blue-600" variant={"link"}>
                See Terms and Conditions here
              </Button>
            }
          />
        </CardContent>
        <CardFooter>
          <CardAction>
            <Link
              data-cy="event-start-register-button"
              href={`/registration/${eventId}`}
            >
              <Button>Register</Button>
            </Link>
          </CardAction>
        </CardFooter>
      </Card>
    </div>
  );
}
