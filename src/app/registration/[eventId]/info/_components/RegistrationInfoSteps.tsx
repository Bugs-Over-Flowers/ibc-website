import {
  CheckCircle,
  CreditCard,
  type LucideIcon,
  QrCode,
  User,
  Users,
} from "lucide-react";

type RegistrationStep = {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
};

const steps: RegistrationStep[] = [
  {
    icon: User,
    number: "01",
    title: "Your Details",
    description:
      "Input your personal details and membership status to get started.",
  },
  {
    icon: Users,
    number: "02",
    title: "Participants",
    description:
      "Register up to 10 people including yourself in a single transaction.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Payment",
    description:
      "Pay via BPI Online or Onsite. Online payments require proof of payment upload for verification.",
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Confirmation",
    description:
      "Review your information to ensure all details are correct before submitting.",
  },
  {
    icon: QrCode,
    number: "05",
    title: "Get QR Code",
    description:
      "Receive your QR code instantly on the success page and via email.",
  },
];

export function RegistrationInfoSteps() {
  return (
    <div className="rounded-xl border border-border bg-card p-7 shadow-sm md:p-9">
      <div className="mb-6">
        <p className="mb-1 font-semibold text-muted text-xs uppercase tracking-widest">
          How it works
        </p>
        <h2 className="font-semibold text-foreground text-xl">
          Registration Steps
        </h2>
      </div>

      <div className="grid items-stretch gap-3 md:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          return (
            <div
              className="relative flex h-full gap-4 md:flex-col md:gap-3"
              key={step.number}
            >
              {!isLast && (
                <div className="absolute top-4 right-[-50%] left-[calc(50%+18px)] z-0 hidden h-px bg-border md:block" />
              )}

              <div className="relative z-10 flex h-full min-h-44 w-full flex-col gap-3 rounded-lg border border-border bg-background p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                    <Icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold font-mono text-border text-lg leading-none">
                    {step.number}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="mb-1 font-semibold text-foreground text-sm">
                    {step.title}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
