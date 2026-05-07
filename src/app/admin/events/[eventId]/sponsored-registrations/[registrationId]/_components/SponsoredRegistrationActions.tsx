"use client";

import { CheckCircle2, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { deleteSR } from "@/server/sponsored-registrations/mutations/deleteSR";
import { updateSRStatus } from "@/server/sponsored-registrations/mutations/updateSR";
import { ConfirmDeleteDialog } from "../../_components/ConfirmDeleteDialog";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SponsoredRegistrationActionsProps {
  sponsoredRegistration: SponsoredRegistration;
  eventId: string;
}

export function SponsoredRegistrationActions({
  sponsoredRegistration,
  eventId,
}: SponsoredRegistrationActionsProps) {
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { execute: toggleStatus, isPending: isTogglingStatus } = useAction(
    tryCatch(async (): Promise<{ success: boolean; wasActive: boolean }> => {
      await updateSRStatus({
        sponsoredRegistrationId: sponsoredRegistration.sponsoredRegistrationId,
        eventId,
      });
      return {
        success: true,
        wasActive: sponsoredRegistration.status === "active",
      };
    }),
    {
      onSuccess: (result: { success: boolean; wasActive: boolean }) => {
        const newStatus = result.wasActive ? "Deactivated" : "Activated";
        const action = result.wasActive ? "deactivated" : "activated";
        toast.success(`${newStatus} successfully`, {
          description: `Sponsored registration is now ${action}. Link ${result.wasActive ? "is no longer" : "is now"} accepting registrations.`,
        });
        router.refresh();
      },
      onError: (error: unknown) => {
        const errorMessage = "Failed to update status";
        let errorDescription = "Please try again later";

        if (typeof error === "string") {
          errorDescription = error;
        } else if (error instanceof Error) {
          errorDescription = error.message;
        }

        toast.error(errorMessage, {
          description: errorDescription,
        });
      },
    },
  );

  const { execute: deleteRegistration, isPending: isDeleting } = useAction(
    tryCatch(async (): Promise<{ success: boolean; sponsorName: string }> => {
      await deleteSR({
        sponsoredRegistrationId: sponsoredRegistration.sponsoredRegistrationId,
        eventId,
      });
      return { success: true, sponsorName: sponsoredRegistration.sponsoredBy };
    }),
    {
      onSuccess: (result: { success: boolean; sponsorName: string }) => {
        toast.success("Deleted successfully", {
          description: `Sponsored registration from "${result.sponsorName}" has been removed.`,
        });
        router.push("/admin/sponsored-registration");
      },
      onError: (error: unknown) => {
        const errorMessage = "Failed to delete";
        let errorDescription = "Please try again later";

        if (typeof error === "string") {
          errorDescription = error;
        } else if (error instanceof Error) {
          errorDescription = error.message;
        }

        toast.error(errorMessage, {
          description: errorDescription,
        });
      },
    },
  );

  const handleToggleStatus = async () => {
    await toggleStatus();
  };

  const handleDeleteConfirm = async () => {
    await deleteRegistration();
    setOpenDeleteDialog(false);
  };

  const isStatusFull = sponsoredRegistration.status === "full";
  const isActive = sponsoredRegistration.status === "active";

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-medium text-muted-foreground text-sm">
            Sponsored Registration Actions
          </h3>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Manage the status and settings for this sponsored registration
          </p>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <Button
            className={cn(
              "gap-2",
              isActive
                ? "border-destructive text-destructive hover:bg-destructive/15 hover:text-destructive"
                : "border-green-600 text-green-600 hover:bg-green-600/15 hover:text-green-600",
            )}
            disabled={isStatusFull || isTogglingStatus}
            onClick={handleToggleStatus}
            variant="outline"
          >
            {isActive ? (
              <>
                <XCircle className="h-4 w-4" />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Activate</span>
              </>
            )}
          </Button>

          <Button
            className="gap-2"
            disabled={isDeleting}
            onClick={() => setOpenDeleteDialog(true)}
            title="Delete sponsored registration"
            variant="destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      <ConfirmDeleteDialog
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onOpenChange={setOpenDeleteDialog}
        open={openDeleteDialog}
        sponsorName={sponsoredRegistration.sponsoredBy}
      />
    </>
  );
}
