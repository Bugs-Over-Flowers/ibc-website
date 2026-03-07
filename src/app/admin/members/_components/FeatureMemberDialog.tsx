"use client";

import { Star } from "lucide-react";
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

type FeatureableMember = Awaited<ReturnType<typeof getMembers>>[number] & {
  featuredExpirationDate?: string | null;
};

interface FeatureMemberDialogProps {
  member: FeatureableMember;
}

export function FeatureMemberDialog({ member }: FeatureMemberDialogProps) {
  const [open, setOpen] = useState(false);
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

    const formatted = new Date(
      member.featuredExpirationDate,
    ).toLocaleDateString();
    return `Featured until ${formatted}`;
  }, [member.featuredExpirationDate]);

  const { execute, isPending } = useAction(tryCatch(featureMember), {
    onSuccess: () => {
      toast.success(`${member.businessName} is now marked as featured.`);
      setOpen(false);
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
      featuredExpirationDate: new Date(expirationDate),
    });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Button
        className="w-full"
        onClick={() => setOpen(true)}
        size="sm"
        type="button"
        variant="secondary"
      >
        <Star className="mr-2 h-4 w-4" />
        Feature Member
      </Button>
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
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setExpirationDate(event.target.value)}
              type="date"
              value={expirationDate}
            />
          </div>

          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => setOpen(false)}
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
