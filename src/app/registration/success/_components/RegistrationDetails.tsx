import type { LucideIcon } from "lucide-react";

interface InfoRow {
  icon: LucideIcon;
  label: string;
  value: string;
  bold: boolean;
}

interface RegistrationDetailsProps {
  infoRows: InfoRow[];
}

export function RegistrationDetails({ infoRows }: RegistrationDetailsProps) {
  return (
    <div className="rounded-2xl bg-card/50 p-6 ring-1 ring-border/25 sm:p-8">
      <h2 className="mb-6 font-bold text-foreground text-lg">
        Registration Details
      </h2>
      <ul className="space-y-5">
        {infoRows.map(({ icon: Icon, label, value, bold }, index) => (
          <li
            className={`flex gap-4 ${
              index !== infoRows.length - 1
                ? "border-primary/15 border-b pb-5"
                : ""
            }`}
            key={label}
          >
            <div className="shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary/30 to-primary/20">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm">{label}</p>
              <p
                className={`wrap-break-word mt-1 text-muted-foreground text-sm leading-relaxed ${
                  bold ? "font-semibold text-foreground" : ""
                }`}
              >
                {value}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
