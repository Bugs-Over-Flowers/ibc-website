"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RegistrationItem } from "@/lib/validation/registration-management";
import { useScanQR } from "../../_hooks/useScanQR";

interface CheckInRegistrationTableProps {
  eventDayId: string;
  eventId: string;
  registrationList: RegistrationItem[];
}

const PAYMENT_STYLES = {
  accepted:
    "border-[#97C459] bg-[#EAF3DE] text-[#27500A] dark:border-[#3B6D11] dark:bg-[#173404] dark:text-[#C0DD97]",
  pending:
    "border-[#EF9F27] bg-[#FAEEDA] text-[#633806] dark:border-[#854F0B] dark:bg-[#412402] dark:text-[#FAC775]",
  rejected:
    "border-[#F09595] bg-[#FCEBEB] text-[#791F1F] dark:border-[#A32D2D] dark:bg-[#501313] dark:text-[#F7C1C1]",
} as const;

const getColumns = ({
  eventDayId,
  activeRegistrationIdentifier,
  scanQRData,
  isPending,
}: {
  eventDayId: string;
  activeRegistrationIdentifier: string | null;
  scanQRData: (registrationIdentifier: string, eventDayId: string) => void;
  isPending: boolean;
}): ColumnDef<RegistrationItem>[] => [
  {
    accessorKey: "registrationIdentifier",
    header: "Identifier",
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
        {row.original.registrationIdentifier}
      </code>
    ),
  },
  {
    accessorKey: "affiliation",
    header: "Affiliation",
    cell: ({ row }) => {
      if (row.original.isMember) {
        return <>{row.original.businessName || row.original.affiliation}</>;
      }

      return <>{row.original.affiliation}</>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const paymentProofStatus = row.original
        .paymentProofStatus as keyof typeof PAYMENT_STYLES;

      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 font-medium text-[11px] capitalize",
            PAYMENT_STYLES[paymentProofStatus] ?? PAYMENT_STYLES.pending,
          )}
        >
          {paymentProofStatus}
        </span>
      );
    },
  },
  {
    accessorKey: "people",
    header: "People",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.people}</span>
    ),
  },
  {
    id: "checkIn",
    header: "",
    enableHiding: false,
    cell: ({ row }) => {
      const isRowLoading =
        isPending &&
        activeRegistrationIdentifier === row.original.registrationIdentifier;

      return (
        <Button
          className="h-7 gap-1.5 px-2.5 text-xs"
          disabled={isPending}
          onClick={(event) => {
            event.stopPropagation();
            scanQRData(row.original.registrationIdentifier, eventDayId);
          }}
          size="sm"
          variant="outline"
        >
          {isRowLoading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <ScanLine className="size-3" />
          )}
          Check in
        </Button>
      );
    },
  },
];

export default function CheckInRegistrationTable({
  eventDayId,
  eventId,
  registrationList,
}: CheckInRegistrationTableProps) {
  const [activeRegistrationIdentifier, setActiveRegistrationIdentifier] =
    useState<string | null>(null);
  const { execute: scanQRData, isPending } = useScanQR({ eventId });

  useEffect(() => {
    if (!isPending) {
      setActiveRegistrationIdentifier(null);
    }
  }, [isPending]);

  const handleScanQR = (registrationIdentifier: string, eventDayId: string) => {
    setActiveRegistrationIdentifier(registrationIdentifier);
    scanQRData(registrationIdentifier, eventDayId);
  };

  return (
    <DataTable
      columns={getColumns({
        activeRegistrationIdentifier,
        eventDayId,
        isPending,
        scanQRData: handleScanQR,
      })}
      data={registrationList}
      tableContainerClassName="rounded-none border-0"
      tableHeaderClassName="bg-muted/20"
    />
  );
}
