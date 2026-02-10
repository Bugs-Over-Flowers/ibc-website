"use client";

import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { deleteSR } from "@/server/sponsored-registrations/actions/deleteSR";
import { updateSRStatus } from "@/server/sponsored-registrations/actions/updateSR";
import { SponsoredRegistrationsRow } from "./SponsoredRegistrationsRow";

type Event = Database["public"]["Tables"]["Event"]["Row"];
type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SponsoredRegistrationsListProps {
  event: Event;
  registrations: SponsoredRegistration[];
}

export function SponsoredRegistrationsList({
  event,
  registrations,
}: SponsoredRegistrationsListProps) {
  const handleCopyLink = (uuid: string, eventId: string) => {
    const link = `${window.location.origin}/events/${eventId}/register?sr=${uuid}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleToggleStatus = async (id: string) => {
    const toastId = toast.loading("Updating status...");

    const { error } = await tryCatch(
      updateSRStatus({
        sponsoredRegistrationId: id,
        eventId: event.eventId,
      }),
    );

    if (error) {
      toast.error(`Failed to update status: ${error}`, { id: toastId });
      return;
    }

    toast.success("Status updated!", { id: toastId });
  };

  const handleDeleteClick = async (registration: SponsoredRegistration) => {
    const confirmed = confirm(
      `Are you sure you want to delete the sponsored registration by ${registration.sponsoredBy}?`,
    );

    if (!confirmed) return;

    const toastId = toast.loading("Deleting...");

    const { error } = await tryCatch(
      deleteSR({
        sponsoredRegistrationId: registration.sponsoredRegistrationId,
        eventId: event.eventId,
      }),
    );

    if (error) {
      toast.error(`Failed to delete: ${error}`, { id: toastId });
      return;
    }

    toast.success("Deleted successfully!", { id: toastId });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sponsored By</TableHead>
          <TableHead>Fee Deduction</TableHead>
          <TableHead>Max Guests</TableHead>
          <TableHead>Used</TableHead>
          <TableHead>Remaining</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {registrations.map((registration, index) => (
          <SponsoredRegistrationsRow
            event={event}
            index={index}
            key={registration.sponsoredRegistrationId}
            onCopyLink={handleCopyLink}
            onDeleteClick={handleDeleteClick}
            onToggleStatus={handleToggleStatus}
            registration={registration}
          />
        ))}
      </TableBody>
    </Table>
  );
}
