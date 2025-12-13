import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Clock, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 *
 * Skeletons
 */
export function StatsSkeleton() {
  return (
    <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:gap-4">
      {[
        { label: "Total Registrations", icon: <Users2 /> },
        { label: "Verified Registrations", icon: <CheckCircle /> },
        { label: "Pending Registrations", icon: <Clock /> },
      ].map(({ label, icon }) => (
        <Card className="h-36 w-full" key={label}>
          <CardContent className="flex h-full flex-col justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-medium text-lg">{label}</h3>
            </div>
            <div>
              <Spinner className="font-medium text-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface TableSkeletonProps<TData = unknown> {
  columns: ColumnDef<TData>[];
  rowCount?: number;
}

export function TableSkeleton<TData = unknown>({
  columns,
  rowCount = 5,
}: TableSkeletonProps<TData>) {
  // Extract headers and generate unique keys from column definitions
  const columnInfo = columns.map((col, idx) => {
    let header = "";
    if (typeof col.header === "string") {
      header = col.header;
    } else if ("accessorKey" in col && typeof col.accessorKey === "string") {
      header = col.accessorKey;
    } else if ("id" in col && typeof col.id === "string") {
      header = col.id;
    }

    const colKey =
      ("accessorKey" in col && typeof col.accessorKey === "string"
        ? col.accessorKey
        : undefined) ||
      ("id" in col && typeof col.id === "string" ? col.id : undefined) ||
      `skeleton-col-${idx}`;

    return { header, col, colKey };
  });

  // Determine if a column is likely an actions column (for styling)
  const isActionsColumn = (col: ColumnDef<TData>, header: string) => {
    return (
      header.toLowerCase() === "actions" ||
      ("id" in col && col.id === "actions") ||
      ("accessorKey" in col && col.accessorKey === "actions")
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columnInfo.map(({ header, col, colKey }) => {
              const isActions = isActionsColumn(col, header);
              return (
                <TableHead
                  className={isActions ? "w-[50px]" : undefined}
                  key={colKey}
                >
                  {header || <Skeleton className="h-4 w-20" />}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }, (_, rowIndex) => {
            const rowKey = `skeleton-row-${rowIndex}`;
            return (
              <TableRow key={rowKey}>
                {columnInfo.map(({ col, colKey, header }) => {
                  const isActions = isActionsColumn(col, header);
                  return (
                    <TableCell key={`${rowKey}-${colKey}`}>
                      {isActions ? (
                        <Skeleton className="h-8 w-8 rounded-md" />
                      ) : (
                        <Skeleton className="h-4 w-32" />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
