"use client";
import useRegistrationStore from "@/hooks/registration.store";
import type { getAllMembers } from "@/server/members/queries";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";

interface RegistrationFormProps {
  members: Awaited<ReturnType<typeof getAllMembers>>;
}

export default function RegistrationForm({ members }: RegistrationFormProps) {
  const step = useRegistrationStore((s) => s.step);
  const eventDetails = useRegistrationStore((s) => s.eventDetails);

  if (!eventDetails) {
    return <div>Loading Registration Form</div>;
  }
  return (
    <main>
      {step === 1 ? (
        <Step1 members={members} />
      ) : step === 2 ? (
        <Step2 />
      ) : step === 3 ? (
        <Step3 />
      ) : (
        <Step4 />
      )}
    </main>
  );
}
