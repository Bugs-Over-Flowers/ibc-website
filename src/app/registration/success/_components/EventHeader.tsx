import { CheckCircle2 } from "lucide-react";

interface EventHeaderProps {
  title: string;
  subtitle: string;
}

export function EventHeader({ title, subtitle }: EventHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative mt-0.5 shrink-0">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
        <div className="relative rounded-full bg-linear-to-br from-primary/20 to-primary/30 p-2.5 ring-1 ring-primary/30">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div className="space-y-1.5">
        <h1 className="font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>
      </div>
    </div>
  );
}
