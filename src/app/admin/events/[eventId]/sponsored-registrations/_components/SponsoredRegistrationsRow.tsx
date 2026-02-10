"use client";

import { motion } from "framer-motion";
import { Copy, ExternalLink, Power, Trash2 } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import type { Database } from "@/lib/supabase/db.types";
import { getStatusBadgeVariant } from "./utils";

const MotionTr = motion.tr;

type Event = Database["public"]["Tables"]["Event"]["Row"];
type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SponsoredRegistrationsRowProps {
  event: Event;
  registration: SponsoredRegistration;
  index: number;
  onCopyLink: (uuid: string, eventId: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteClick: (registration: SponsoredRegistration) => void;
}

export function SponsoredRegistrationsRow({
  event,
  registration,
  index,
  onCopyLink,
  onToggleStatus,
  onDeleteClick,
}: SponsoredRegistrationsRowProps) {
  const router = useRouter();
  const remainingGuests =
    (registration.maxSponsoredGuests ?? 0) - registration.usedCount;

  return (
    <MotionTr
      animate={{ opacity: 1, y: 0 }}
      className="border-b transition-colors hover:bg-muted/50"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: index * 0.05 }}
    >
      <TableCell className="font-medium">{registration.sponsoredBy}</TableCell>
      <TableCell>
        {registration.feeDeduction === event.registrationFee ? (
          <Badge variant="default">FREE</Badge>
        ) : (
          <span>₱{registration.feeDeduction.toLocaleString()}</span>
        )}
      </TableCell>
      <TableCell>{registration.maxSponsoredGuests}</TableCell>
      <TableCell>{registration.usedCount}</TableCell>
      <TableCell>
        <span
          className={
            remainingGuests === 0 ? "text-destructive" : "text-foreground"
          }
        >
          {remainingGuests}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(registration.status)}>
          {registration.status.toUpperCase()}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(registration.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            onClick={() => onCopyLink(registration.uuid, event.eventId)}
            size="icon"
            title="Copy link"
            variant="ghost"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            onClick={() =>
              router.push(
                `/events/${event.eventId}/register?sr=${registration.uuid}` as Route,
              )
            }
            size="icon"
            title="Open link"
            variant="ghost"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            disabled={registration.status === "full"}
            onClick={() => onToggleStatus(registration.sponsoredRegistrationId)}
            size="icon"
            title={registration.status === "active" ? "Disable" : "Enable"}
            variant="ghost"
          >
            <Power
              className={`h-4 w-4 ${
                registration.status === "active"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
          <Button
            onClick={() => onDeleteClick(registration)}
            size="icon"
            title="Delete"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </MotionTr>
  );
}
