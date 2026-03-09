import { CheckCircle2, Clock3, Mail } from "lucide-react";

export function WhatsNextSection() {
  const steps = [
    {
      icon: Clock3,
      title: "Review in Progress",
      description: "Our team is now validating your application details.",
    },
    {
      icon: Mail,
      title: "Email Update",
      description: "You will receive the result and next steps by email.",
    },
  ];

  return (
    <div className="rounded-2xl bg-card/50 p-6 ring-1 ring-border/25 sm:p-8">
      <h2 className="mb-6 font-bold text-foreground text-lg">
        What Happens Next
      </h2>
      <div className="space-y-5">
        {steps.map((step, index) => (
          <div
            className={`flex gap-4 ${
              index !== steps.length - 1
                ? "border-primary/15 border-b pb-5"
                : ""
            }`}
            key={step.title}
          >
            <div className="shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary/30 to-primary/20">
                <step.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-sm">
                {step.title}
              </h3>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
