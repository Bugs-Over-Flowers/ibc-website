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

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "disabled":
      return "bg-muted text-muted-foreground";
    case "full":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}
