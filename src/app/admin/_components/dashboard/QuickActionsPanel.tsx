import { FileCheck2, PlusCircle, UserPlus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_ACTIONS: Array<{
  label: string;
  href: Route;
  icon: typeof FileCheck2;
}> = [
  {
    label: "Review Applications",
    href: "/admin/application",
    icon: FileCheck2,
  },
  {
    label: "Create Event",
    href: "/admin/create-event",
    icon: PlusCircle,
  },
  {
    label: "Add Member",
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
            <Link className="block" href={action.href} key={action.label}>
              <Button
                className="flex h-auto min-h-16 w-full items-center justify-start gap-3 rounded-lg px-3 py-3 text-left"
                variant="outline"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="block flex-1 text-left font-medium text-sm leading-tight">
                  {action.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
