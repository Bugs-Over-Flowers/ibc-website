"use client";
import { Building2, ClipboardCheck, CreditCard, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import useRegistrationStore from "@/hooks/registration.store";
import type Step from "@/lib/types/Step";
import { cn } from "@/lib/utils";

const STEPS: Array<{
  title: string;
  description: string;
  Icon: typeof Building2;
}> = [
  {
    title: "Affiliation",
    description: "Organization info",
    Icon: Building2,
  },
  {
    title: "Participants",
    description: "Attendee details",
    Icon: Users,
  },
  {
    title: "Payment",
    description: "Payment method",
    Icon: CreditCard,
  },
  {
    title: "Review",
    description: "Confirm & submit",
    Icon: ClipboardCheck,
  },
];

export default function Stepper() {
  const step = useRegistrationStore((state) => state.step);

  return (
    <div className="w-full">
      {/* Desktop Sidebar Stepper */}
      <nav aria-label="Registration steps" className="hidden lg:block">
        <ol className="space-y-2">
          {STEPS.map((s, index) => {
            const isCompleted = step > index + 1;
            const isActive = step === index + 1;
            const { Icon } = s;
            return (
              <li
                aria-current={isActive ? "step" : undefined}
                className="relative"
                key={s.title}
              >
                <div
                  className={cn(
                    "flex items-start gap-4 rounded-lg p-3 transition-all",
                    isActive && "bg-primary/10",
                    !isActive && !isCompleted && "opacity-60",
                  )}
                >
                  {/* Icon Circle */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      isCompleted &&
                        "border-primary bg-primary text-primary-foreground",
                      isActive && "border-primary bg-card text-primary",
                      !isCompleted &&
                        !isActive &&
                        "border-muted bg-card text-muted",
                    )}
                  >
                    {isCompleted ? (
                      <svg
                        aria-label="Step completed"
                        className="h-5 w-5"
                        fill="currentColor"
                        role="img"
                        viewBox="0 0 20 20"
                      >
                        <title>Step completed</title>
                        <path
                          clipRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          fillRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {/* Step Content */}
                  <div className="flex-1 pt-0.5">
                    <div
                      className={cn(
                        "font-semibold text-sm transition-colors",
                        isActive && "text-primary",
                        !isActive && !isCompleted && "text-muted-foreground",
                        isCompleted && "text-foreground",
                      )}
                    >
                      {s.title}
                    </div>
                    <div
                      className={cn(
                        "text-xs transition-colors",
                        isActive && "text-primary/70",
                        !isActive && !isCompleted && "text-muted-foreground/60",
                        isCompleted && "text-muted-foreground",
                      )}
                    >
                      {s.description}
                    </div>
                  </div>
                </div>
                {/* Vertical Line */}
                {index < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute top-[52px] left-[27px] h-4 w-0.5 transition-colors",
                      isCompleted ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile Stepper */}
      <nav aria-label="Registration steps" className="lg:hidden">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-foreground text-sm">
            {STEPS[step - 1]?.title}
          </span>
          <span className="text-muted-foreground text-sm">
            Step {step}/{STEPS.length}
          </span>
        </div>
        <Progress
          aria-valuemax={STEPS.length}
          aria-valuenow={step}
          value={(step / STEPS.length) * 100}
        />
      </nav>
    </div>
  );
}
