"use client";

import { Eye } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ViewDetailsButtonProps {
  eventId: string;
  onAction?: () => void;
}

export default function ViewDetailsButton({
  eventId,
  onAction,
}: ViewDetailsButtonProps) {
  const handleViewDetails = () => {
    console.log("View details for event:", eventId);
    if (onAction) onAction();
  };

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onSelect={(e) => {
        e.preventDefault();
        handleViewDetails();
      }}
    >
      <Eye className="mr-2 h-4 w-4" />
      <span>View Details</span>
    </DropdownMenuItem>
  );
}
