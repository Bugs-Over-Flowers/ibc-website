import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export function getStatusBadgeVariant(status: string): BadgeVariant {
  switch (status.toLowerCase()) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "full":
      return "destructive";
    default:
      return "outline";
  }
}
