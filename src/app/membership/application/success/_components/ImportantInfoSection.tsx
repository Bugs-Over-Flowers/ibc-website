import { Info } from "lucide-react";

export function ImportantInfoSection() {
  return (
    <div className="rounded-2xl bg-card/50 p-6 ring-1 ring-border/25 sm:p-8">
      <div className="flex gap-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <h3 className="mb-3 font-bold text-foreground text-lg">
            Important Notes
          </h3>
          <ul className="space-y-2 pl-5 text-muted-foreground text-sm">
            <li className="list-disc">
              Typical review time: 5-7 business days.
            </li>
            <li className="list-disc">
              Keep your Application ID for status checks.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
