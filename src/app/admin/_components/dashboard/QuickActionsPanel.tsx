import { FileCheck2, PlusCircle, UserPlus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_ACTIONS: Array<{
  label: string;
  description: string;
  href: Route;
  icon: typeof FileCheck2;
}> = [
  {
    label: "Review Applications",
    description: "Approve or reject pending membership requests.",
    href: "/admin/application",
    icon: FileCheck2,
  },
  {
    label: "Create Event",
    description: "Set up a new event and publish registration details.",
    href: "/admin/create-event",
    icon: PlusCircle,
  },
  {
    label: "Add Member",
    description: "Create manual member records and keep directories current.",
    href: "/admin/members/create",
    icon: UserPlus,
  },
];

export function QuickActionsPanel() {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;

          return (
            <Link href={action.href} key={action.label}>
              <Button
                className="h-auto w-full items-start justify-start gap-3 rounded-lg px-3 py-3 text-left"
                variant="outline"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="space-y-1">
                  <span className="block font-medium text-sm">
                    {action.label}
                  </span>
                  <span className="block text-muted-foreground text-xs">
                    {action.description}
                  </span>
                </span>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
