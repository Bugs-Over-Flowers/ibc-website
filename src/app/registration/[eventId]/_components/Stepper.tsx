"use client";
import { Check } from "lucide-react";
import useRegistrationStore from "@/hooks/registration.store";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    label: "Member Type",
  },
  {
    label: "Participants",
  },
  {
    label: "Payment",
  },
  {
    label: "Review",
  },
];

export default function Stepper() {
  const currentStep = useRegistrationStore((state) => state.step);

  const progressWidth = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="mb-6 w-full sm:mb-8">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 rounded-full bg-secondary" />
        <div
          className="absolute top-1/2 left-0 -z-10 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${progressWidth}%` }}
        />

        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div className="flex flex-col items-center" key={step.label}>
              <div
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${stepNumber}: ${step.label}${isCompleted ? " (Completed)" : ""}`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold text-xs transition-all duration-300 sm:h-10 sm:w-10 sm:text-sm",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                  isActive &&
                    "border-primary bg-background text-primary shadow-md",
                  !isCompleted &&
                    !isActive &&
                    "border-muted bg-background text-muted-foreground",
                )}
                role="img"
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  stepNumber
                )}
              </div>

              <span
                className={cn(
                  "mt-1 hidden text-center font-medium text-xs transition-colors sm:mt-2 sm:block sm:text-sm",
                  isActive || isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
