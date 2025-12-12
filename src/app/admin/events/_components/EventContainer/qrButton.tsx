"use client";

import { QrCode } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface QrButtonProps {
  eventId: string;
  onAction?: () => void;
}

export default function QrButton({ eventId, onAction }: QrButtonProps) {
  const handleQrCode = () => {
    console.log("Generate QR code for event:", eventId);
    if (onAction) onAction();
  };

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onSelect={(e) => {
        e.preventDefault();
        handleQrCode();
      }}
    >
      <QrCode className="mr-2 h-4 w-4" />
      <span>QR Code</span>
    </DropdownMenuItem>
  );
}
