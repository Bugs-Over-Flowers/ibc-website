import { formatDate } from "date-fns";
import FormButtons from "@/components/FormButtons";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import useRegistrationStore from "@/hooks/registration.store";

export default function Step4() {
  const setStep = useRegistrationStore((s) => s.setStep);
  const registrationData = useRegistrationStore((s) => s.registrationData);
  const eventDetails = useRegistrationStore((s) => s.eventDetails);

  const { principalRegistrant, otherRegistrants } =
    registrationData?.step2 || {};

  const { paymentMethod } = registrationData?.step3 || {};

  return (
    <div className="space-y-3">
      <div>
        <h2>Confirm Registration</h2>
        <p>Please review your registration details below:</p>
      </div>
      <ItemGroup>
        <Item variant={"outline"}>
          <ItemContent className="flex flex-col gap-3">
            <ItemTitle>Event</ItemTitle>
            <div>
              <ItemDescription>{eventDetails?.eventTitle}</ItemDescription>
              {eventDetails?.eventStartDate && (
                <p>
                  {formatDate(eventDetails?.eventStartDate, "MMMM d, yyyy")}
                </p>
              )}
            </div>
            <ItemSeparator />
            <div>
              <ItemTitle>People</ItemTitle>
              <div>
                Total people under this registration:{" "}
                {1 + (otherRegistrants?.length ?? 0)}
              </div>
              <div className="py-2">
                <div className="font-semibold">Participant 1</div>

                <div>
                  {principalRegistrant?.firstName}{" "}
                  {principalRegistrant?.lastName}
                </div>
                <div>{principalRegistrant?.email}</div>
              </div>
              {otherRegistrants && otherRegistrants.length > 0 && (
                <>
                  <div>Other People:</div>
                  {otherRegistrants?.map((person, idx) => (
                    <div key={person.firstName} className="py-2">
                      <div className="font-semibold">Participant {idx + 2}</div>
                      <div>
                        {person.firstName} {person.lastName}
                      </div>
                      <div>{person.email}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <ItemSeparator />
            <div>
              <ItemTitle>Payment</ItemTitle>
              <div className="flex justify-between">
                <div>Payment Method</div>
                <div>
                  <Badge variant={"secondary"}>{paymentMethod}</Badge>
                </div>
              </div>
            </div>
          </ItemContent>
        </Item>
        <Item>
          <ItemContent></ItemContent>
        </Item>
      </ItemGroup>
      <FormButtons onNext={() => setStep(5)} onBack={() => setStep(3)} />
    </div>
  );
}
