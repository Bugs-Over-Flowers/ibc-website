"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { featureMember } from "@/server/members/actions/featureMember";
import type { getMembers } from "@/server/members/queries/getMembers";

export type FeatureableMember = Awaited<ReturnType<typeof getMembers>>[number];

interface FeatureMemberDialogProps {
  member: FeatureableMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureMemberDialog({
  member,
  open,
  onOpenChange,
}: FeatureMemberDialogProps) {
  const [expirationDate, setExpirationDate] = useState(
    member.featuredExpirationDate ?? "",
  );

  useEffect(() => {
    if (open) {
      setExpirationDate(member.featuredExpirationDate ?? "");
    }
  }, [member.featuredExpirationDate, open]);

  const currentStatus = useMemo(() => {
    if (!member.featuredExpirationDate) {
      return "Not currently featured";
    }

    // Use "T00:00:00" suffix to ensure local timezone interpretation for date-only string
    const formatted = new Date(
      `${member.featuredExpirationDate}T00:00:00`,
    ).toLocaleDateString();
    return `Featured until ${formatted}`;
  }, [member.featuredExpirationDate]);

  const { execute, isPending } = useAction(tryCatch(featureMember), {
    onSuccess: () => {
      toast.success(`${member.businessName} is now marked as featured.`);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!expirationDate) {
      toast.error("Please select an expiration date.");
      return;
    }

    await execute({
      memberId: member.businessMemberId,
      featuredExpirationDate: expirationDate, // Send YYYY-MM-DD string directly
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feature {member.businessName}</DialogTitle>
          <DialogDescription>{currentStatus}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="featuredExpirationDate">
              Feature expiration date
            </Label>
            <Input
              id="featuredExpirationDate"
              // Use local date string YYYY-MM-DD instead of UTC
              min={new Date().toLocaleDateString("en-CA")}
              onChange={(event) => setExpirationDate(event.target.value)}
              type="date"
              value={expirationDate}
            />
          </div>

          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
