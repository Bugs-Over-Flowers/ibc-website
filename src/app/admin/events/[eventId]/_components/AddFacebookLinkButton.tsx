"use client";

import { useEffect, useState } from "react";
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
import { updateFacebookLink } from "@/server/events/mutations/updateFacebookLink";

type AddFacebookLinkButtonProps = {
  eventId: string;
  facebookLink?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
};

export default function AddFacebookLinkButton({
  eventId,
  facebookLink,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: AddFacebookLinkButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen =
    isControlled && onOpenChange ? onOpenChange : setInternalOpen;
  const [linkValue, setLinkValue] = useState(facebookLink ?? "");

  const { execute, isPending } = useAction(updateFacebookLink, {
    onSuccess: (data) => {
      toast.success(data.message);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(
        typeof error === "string" ? error : "Failed to update Facebook link",
      );
    },
  });

  useEffect(() => {
    if (isOpen) {
      setLinkValue(facebookLink ?? "");
    }
  }, [isOpen, facebookLink]);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedValue = linkValue.trim();

    await execute({
      eventId,
      facebookLink: normalizedValue.length ? normalizedValue : null,
    });
  };

  return (
    <>
      {!hideTrigger && (
        <Button
          className="w-full"
          onClick={() => setIsOpen(true)}
          variant="outline"
        >
          Add Facebook Link
        </Button>
      )}
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Facebook Link</DialogTitle>
            <DialogDescription>
              Paste the full Facebook event URL. Leave blank to remove the link.
              ensure to include an https:// in the link
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="facebook-link">Facebook URL</Label>
              <Input
                autoFocus
                disabled={isPending}
                id="facebook-link"
                onChange={(event) => setLinkValue(event.target.value)}
                placeholder="https://www.facebook.com/events/..."
                type="string"
                value={linkValue}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? "Saving..." : "Save Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
