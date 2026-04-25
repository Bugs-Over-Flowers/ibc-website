"use client";

import type { ColumnDef } from "@tanstack/react-table";
import writeXlsxFile from "write-excel-file/browser";

type ExcelCell = string | number | boolean | Date | null | undefined;

export interface ExportToExcelOptions<TData> {
  /**
   * The data to export
   */
  data: TData[];
  /**
   * Column definitions from TanStack Table
   */
  columns: ColumnDef<TData>[];
  /**
   * Name of the Excel file (without extension)
   * If not provided, defaults to "export_YYYY-MM-DD"
   */
  filename?: string;
  /**
   * Name of the worksheet tab
   * Defaults to "Sheet1"
   */
  sheetName?: string;
  /**
   * Column keys to exclude from export (e.g., ["actions", "id"])
   * Defaults to ["actions"]
   */
  excludeColumns?: string[];
  /**
   * Custom formatters for specific column keys
   * Key is the accessorKey, value is a function that transforms the cell value
   */
  formatters?: Partial<
    Record<keyof TData, (value: unknown, row: TData) => string | number>
  >;
  /**
   * Custom column widths (in characters)
   * Defaults to 20 for all columns
   */
  columnWidths?: number[];
}

/**
 * Exports data to Excel format using TanStack Table column definitions.
 *
 * @param options - Configuration options for the export
 * @returns Promise that resolves when export is complete
 *
 * @example
 * ```ts
 * await exportToExcel({
 *   data: participantList,
 *   columns: participantListColumns,
 *   filename: "participants",
 *   excludeColumns: ["actions"],
 * });
 * ```
 */
export async function exportToExcel<TData extends Record<string, unknown>>(
  options: ExportToExcelOptions<TData>,
): Promise<void> {
  const {
    data,
    columns,
    filename,
    sheetName = "Sheet1",
    excludeColumns = ["actions"],
    formatters = {},
    columnWidths,
  } = options;

  try {
    const exportableColumns = columns.flatMap((col) => {
      if (!("accessorKey" in col) || col.accessorKey == null) {
        return [];
      }

      const key = String(col.accessorKey);
      if (excludeColumns.includes(key)) {
        return [];
      }

      return [
        {
          key,
          header: typeof col.header === "string" ? col.header : key,
        },
      ];
    });

    const formattersByKey = formatters as Record<
      string,
      (value: unknown, row: TData) => string | number
    >;

    const getCellValue = (row: TData, key: string): ExcelCell => {
      const value = row[key as keyof TData];

      const formatter = formattersByKey[key];
      if (formatter) {
        return formatter(value, row);
      }

      if (value === null || value === undefined) {
        return "";
      }

      if (value instanceof Date) {
        return value.toLocaleDateString();
      }

      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }

      return value as ExcelCell;
    };

    const sheetData: ExcelCell[][] = [
      exportableColumns.map((column) => column.header),
      ...data.map((row) =>
        exportableColumns.map((column) => getCellValue(row, column.key)),
      ),
    ];

    const sheetColumns = exportableColumns.map((_, index) => ({
      width: columnWidths?.[index] ?? 20,
    }));

    const finalFilename = filename
      ? filename.endsWith(".xlsx")
        ? filename
        : `${filename}.xlsx`
      : `export_${new Date().toISOString().split("T")[0]}.xlsx`;

    const workbook = writeXlsxFile(sheetData, {
      sheet: sheetName,
      columns: sheetColumns,
    });

    await workbook.toFile(finalFilename);
  } catch (error) {
    console.error("Failed to export to Excel:", error);
    throw error;
  }
}
