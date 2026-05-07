"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickOnsiteRegistrationTriggerCardProps {
  onOpen: () => void;
}

export default function QuickOnsiteRegistrationTriggerCard({
  onOpen,
}: QuickOnsiteRegistrationTriggerCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <Plus className="size-4" />
        </div>
        <div>
          <p className="font-medium text-sm">Quick Registration</p>
          <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
            Register a walk-in, accept payment, and check in immediately.
          </p>
        </div>
      </div>
      <Button
        className="w-full gap-1.5"
        onClick={onOpen}
        size="sm"
        variant="outline"
      >
        <Plus className="size-3.5" />
        Register Walk-In
      </Button>
    </div>
  );
}
