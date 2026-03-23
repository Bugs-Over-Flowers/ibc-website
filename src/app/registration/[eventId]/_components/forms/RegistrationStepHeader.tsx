import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RegistrationStepHeaderProps {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
  description: string;
  className?: string;
}

export default function RegistrationStepHeader({
  Icon,
  title,
  description,
  className,
}: RegistrationStepHeaderProps) {
  return (
    <CardHeader
      className={cn("border-border/30 border-b pb-4 sm:pb-6", className)}
    >
      <CardTitle className="flex items-center gap-2 font-semibold text-xl sm:text-2xl">
        <Icon className="h-6 w-6 text-primary" />
        {title}
      </CardTitle>
      <CardDescription className="text-muted-foreground text-sm">
        {description}
      </CardDescription>
    </CardHeader>
  );
}
