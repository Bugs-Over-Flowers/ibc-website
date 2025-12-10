import { AlertCircle } from "lucide-react";
import type { Route } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import TermsAndConditions from "@/components/TermsAndConditions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import tryCatch from "@/lib/server/tryCatch";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";

type InformationPageProps = PageProps<"/registration/[e]/info">;
export default function InfoPageWrapper({ params }: InformationPageProps) {
  return (
    <Suspense>
      <InfoPage params={params} />
    </Suspense>
  );
}

async function InfoPage({
  params,
}: {
  params: InformationPageProps["params"];
}) {
  const { e } = await params;
  const requestCookies = (await cookies()).getAll();
  const {
    error: registrationEventDetailsMessage,
    data,
    success,
  } = await tryCatch(
    getRegistrationEventDetails(requestCookies, { eventId: e }),
  );

  if (!success) {
    return <div>{registrationEventDetailsMessage}</div>;
  }

  return (
    <div className="p-10">
      <Card>
        <CardHeader>
          {data.eventHeaderUrl && (
            <ImageZoom className="relative h-96 rounded-md">
              <Image
                alt={data.eventTitle}
                className="object-cover"
                fill
                src={data.eventHeaderUrl}
              />
            </ImageZoom>
          )}
          <CardTitle className="pt-3">
            <h3>{data.eventTitle}</h3>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-2">
          <div>{data.description}</div>
          <Item variant={"outline"}>
            <ItemContent>
              <ItemTitle> Registration Steps</ItemTitle>
              <div>
                <ol>
                  <li>Step 1: Input your details: membership status</li>
                  <li>
                    Step 2: Input the people you want to register. Up to 10
                    people only including yourself.
                  </li>
                  <li>
                    Step 3: Pay the registration fee. Currently we have{" "}
                    <strong>BPI / ONLINE</strong> and <strong>ONSITE</strong>{" "}
                    payment methods available. When choosing ONLINE, you will
                    need to provide a proof of payment that will be subject for
                    verification.
                  </li>
                  <li>
                    Step 4: Confirm your registration. Ensure that your details
                    are correct.
                  </li>
                  <li>
                    Step 5: You will receive a QR Code that will be used for
                    check-in during the event. You will also receive this on
                    your email.
                  </li>
                </ol>
              </div>
            </ItemContent>
          </Item>
          <TermsAndConditions
            triggerOverride={
              <Button variant={"ghost"}>See Terms and Conditions here.</Button>
            }
          />
        </CardContent>
        <Separator />
        <CardFooter>
          <CardAction>
            <Link href={`/registration/${e}/` as Route}>
              <Button>Register</Button>
            </Link>
          </CardAction>
        </CardFooter>
      </Card>
    </div>
  );
}
