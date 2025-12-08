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
      <div className="md:block hidden w-full">
        {STEPS.map((s, index) => (
          <div
            key={s.title}
            className={cn(
              "flex items-center gap-3 mb-4 last:mb-0 py-1 px-2 w-full",
              step === index + 1 && "border border-primary rounded-md",
            )}
          >
            {/*Step Number*/}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2",
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
      <div className="md:hidden block space-y-2">
        <div>Step {step} of 4</div>
        <Progress value={(step / 4) * 100} />
        <div>{STEPS[step - 1].title}</div>
      </div>
    </div>
  );
}
