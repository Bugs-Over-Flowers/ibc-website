"use client";

import { Eye } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ViewDetailsButtonProps {
  eventId: string;
}

export default function ViewDetailsButton({ eventId }: ViewDetailsButtonProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/admin/events/${eventId}` as Route);
  };

  return (
    <DropdownMenuItem className="cursor-pointer" onClick={handleViewDetails}>
      <Eye className="mr-2 h-4 w-4" />
      <span>View Details</span>
    </DropdownMenuItem>
  );
}
