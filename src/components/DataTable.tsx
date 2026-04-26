"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type Table as TableType,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  paginationControls?: {
    position: "top" | "bottom";
    render: React.ReactNode;
  };
  enableClearSorting?: boolean;
  clearSortingLabel?: string;
  tableContainerClassName?: string;
  tableHeaderClassName?: string;
  children?: (table: TableType<TData>) => React.ReactNode;
  enablePagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  paginationControls,
  enableClearSorting = false,
  clearSortingLabel = "Clear sorting",
  tableContainerClassName,
  tableHeaderClassName,
  children,
  enablePagination = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(enablePagination
      ? { getPaginationRowModel: getPaginationRowModel() }
      : {}),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <div>
      {(paginationControls?.position === "top" || enableClearSorting) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            {paginationControls?.position === "top" &&
              paginationControls.render}
          </div>
          {enableClearSorting && (
            <Button
              disabled={sorting.length === 0}
              onClick={() => table.resetSorting()}
              size="sm"
              type="button"
              variant="outline"
            >
              {clearSortingLabel}
            </Button>
          )}
        </div>
      )}

      <div
        className={cn(
          "overflow-x-auto rounded-md border",
          tableContainerClassName,
        )}
      >
        <Table>
          <TableHeader className={cn("bg-secondary/10", tableHeaderClassName)}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {paginationControls?.position === "bottom" && paginationControls.render}
      {children?.(table)}
    </div>
  );
}
