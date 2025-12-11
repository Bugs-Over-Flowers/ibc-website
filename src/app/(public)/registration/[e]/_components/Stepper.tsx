"use client";
import { Progress } from "@/components/ui/progress";
import useRegistrationStore from "@/hooks/registration.store";
import type Step from "@/lib/types/Step";
import { cn } from "@/lib/utils";

const STEPS: Step[] = [
  {
    title: "Affiliation",
    description: "Member Status",
  },
  {
    title: "Participants",
    description: "Registration Details",
  },
  {
    title: "Payment",
    description: "Payment Selection",
  },
  {
    title: "Review and Confirm",
    description: "Verify Information",
  },
];

export default function Stepper() {
  const step = useRegistrationStore((s) => s.step);

  return (
    <div className="flex flex-col">
      <div className="hidden w-full md:block">
        {STEPS.map((s, index) => (
          <div
            className={cn(
              "mb-4 flex w-full items-center gap-3 px-2 py-1 last:mb-0",
              step === index + 1 && "rounded-md border border-primary",
            )}
            key={s.title}
          >
            {/*Step Number*/}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                step === index + 1
                  ? "bg-primary text-primary-foreground"
                  : "border-neutral-400 bg-white",
              )}
            >
              {index + 1}
            </div>
            {/*Step Details*/}
            <div>
              <div className="font-semibold">{s.title}</div>
              <div className="text-sm">{s.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="block space-y-2 md:hidden">
        <div>Step {step} of 4</div>
        <Progress value={(step / 4) * 100} />
        <div>{STEPS[step - 1].title}</div>
      </div>
    </div>
  );
}
