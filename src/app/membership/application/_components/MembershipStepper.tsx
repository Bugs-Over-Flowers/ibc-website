import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MembershipStep {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface MembershipStepperProps {
  currentStep: number;
  steps: MembershipStep[];
}

export function MembershipStepper({
  currentStep,
  steps,
}: MembershipStepperProps) {
  const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-8 w-full">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 rounded-full bg-secondary" />
        <div
          className="absolute top-1/2 left-0 -z-10 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${progressWidth}%` }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div className="flex flex-col items-center" key={step.id}>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300",
                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                  isActive &&
                    "border-primary bg-background text-primary shadow-md",
                  !isCompleted &&
                    !isActive &&
                    "border-muted bg-background text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              <span
                className={cn(
                  "mt-2 text-center font-medium text-xs transition-colors sm:text-sm",
                  isActive || isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
