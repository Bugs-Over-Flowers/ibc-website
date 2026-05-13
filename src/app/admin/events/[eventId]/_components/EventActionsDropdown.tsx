"use client";

import {
  Copy,
  Edit,
  Globe,
  MoreVertical,
  QrCode,
  UserCheck2Icon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EvaluationQRDownloader } from "@/components/qr/EvaluationQRDownloader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddFacebookLinkButton from "./AddFacebookLinkButton";
import CheckInButton from "./CheckInButton";
import CopyRegistrationLinkButton from "./CopyRegistrationLinkButton";

interface EventActionsDropdownProps {
  eventId: string;
  facebookLink?: string | null;
  eventTitle: string;
  isDraft: boolean;
  showEditButton: boolean;
}

export default function EventActionsDropdown({
  eventId,
  facebookLink,
  eventTitle,
  isDraft,
  showEditButton,
}: EventActionsDropdownProps) {
  const router = useRouter();
  const [facebookOpen, setFacebookOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [evalOpen, setEvalOpen] = useState(false);

  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/events/${eventId}/register`;
      await navigator.clipboard.writeText(link);
      toast.success("Registration link copied to clipboard!");
    } catch {
      toast.error("Failed to copy registration link");
    }
  };

  return (
    <>
      {/* Desktop: horizontal row */}
      <div className="hidden w-max flex-col items-center gap-2 lg:flex">
        <CopyRegistrationLinkButton eventId={eventId} />
        <AddFacebookLinkButton eventId={eventId} facebookLink={facebookLink} />
        <EvaluationQRDownloader eventId={eventId} eventTitle={eventTitle} />
        {!isDraft && <CheckInButton eventId={eventId} />}
        {showEditButton && (
          <Button
            className="w-full"
            nativeButton={false}
            render={
              <Link href={`/admin/events/${eventId}/edit-event` as Route}>
                <Edit className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Link>
            }
            size="sm"
            variant="outline"
          />
        )}
      </div>

      {/* Mobile: dropdown + hidden dialog triggers */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="sm" variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
          />

          <DropdownMenuContent align="end" sideOffset={8}>
            <DropdownMenuItem onSelect={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Registration Link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFacebookOpen(true)}>
              <Globe className="mr-2 h-4 w-4" />
              {facebookLink ? "Update" : "Add"} Facebook Link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEvalOpen(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              Evaluation QR
            </DropdownMenuItem>
            {!isDraft && (
              <DropdownMenuItem onSelect={() => setCheckInOpen(true)}>
                <UserCheck2Icon className="mr-2 h-4 w-4" />
                Check In
              </DropdownMenuItem>
            )}
            {showEditButton && (
              <DropdownMenuItem
                onSelect={() =>
                  router.push(`/admin/events/${eventId}/edit-event`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Triggerless dialog controls for mobile */}
        <AddFacebookLinkButton
          eventId={eventId}
          facebookLink={facebookLink}
          hideTrigger
          onOpenChange={setFacebookOpen}
          open={facebookOpen}
        />
        <EvaluationQRDownloader
          eventId={eventId}
          eventTitle={eventTitle}
          hideTrigger
          onOpenChange={setEvalOpen}
          open={evalOpen}
        />
        {!isDraft && (
          <CheckInButton
            eventId={eventId}
            hideTrigger
            onOpenChange={setCheckInOpen}
            open={checkInOpen}
          />
        )}
      </div>
    </>
  );
}
