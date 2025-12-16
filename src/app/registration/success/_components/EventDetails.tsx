import { formatDate } from "date-fns";
import { CircleAlert } from "lucide-react";
import type { Route } from "next";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import Link from "next/link";
import QRDownloader from "@/components/qr/QRDownloader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { getSuccessPageData } from "@/server/registration/queries/getSuccessPageData";
import QRCodeItem from "./QRCodeItem";

interface EventDetailsProps {
  cookieStore: RequestCookie[];
  registrationIdentifier: string;
}

export default async function EventDetails({
  cookieStore,
  registrationIdentifier,
}: EventDetailsProps) {
  const data = await getSuccessPageData(cookieStore, {
    registrationIdentifier,
  });

  if (
    !data ||
    !data.registeredEvent ||
    !data.registeredEvent.eventStartDate ||
    !data.registrationDetails
  ) {
    return null;
  }

  const renderPaymentMethodText =
    data.registrationDetails?.paymentMethod === "ONSITE"
      ? `Please ensure to be able to pay on the event proper at ${formatDate(data.registeredEvent?.eventStartDate, "MMMM d, yyyy")}`
      : `Please be in touch with IBC to verify your payment status.`;

  return (
    <div className="pt-5 pb-5 md:pb-10">
      <Card className="flex flex-col">
        <CardContent>
          <h4>
            You have successfully registered for{" "}
            {data.registeredEvent?.eventTitle}!
          </h4>
        </CardContent>
        <Separator />
        <CardContent>
          <Item>
            <ItemMedia variant={"icon"}>
              <CircleAlert />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Please take note of the following:</ItemTitle>
              <ItemDescription>
                - Your registration is confirmed.
                <br />- You will receive a confirmation email with your
                registration details. Please check your email at{" "}
                <strong>{data.email}</strong>.
                <br />- You have paid{" "}
                <strong>{data.registrationDetails?.paymentMethod}. </strong>
                {renderPaymentMethodText}.
                <br />- If you have any questions, please contact us.
              </ItemDescription>
            </ItemContent>
          </Item>
        </CardContent>
        <Separator />
        <CardHeader>
          <CardTitle>Please download your QR code.</CardTitle>
          <CardDescription>
            This will be used for check-in during the event for you and the
            people you registered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <QRDownloader
              affiliation={data.affiliation}
              email={data.email}
              registrationIdentifier={registrationIdentifier}
            >
              <div className="relative size-30 md:size-50">
                <QRCodeItem encodedRegistrationData={registrationIdentifier} />
              </div>
            </QRDownloader>
          </div>
        </CardContent>
        <Separator />

        <CardFooter className="flex flex-col gap-4 md:flex-row">
          <Link href="/events">
            <Button>Return To Events Page</Button>
          </Link>
          <Link href={`/events/${data.registeredEvent.eventId}` as Route}>
            <Button>Return To Event</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
