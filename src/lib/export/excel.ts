import type { ColumnDef } from "@tanstack/react-table";
import writeXlsxFile from "write-excel-file";

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
    // Filter out excluded columns and ensure they have accessor keys
    const exportableColumns = columns.filter((col) => {
      if (!("accessorKey" in col)) return false;
      const key = col.accessorKey as string;
      return !excludeColumns.includes(key);
    });

    // Create schema for write-excel-file
    const schema = exportableColumns.map((col, index) => {
      const key = (col as { accessorKey: string }).accessorKey as keyof TData;
      const header =
        typeof col.header === "string" ? col.header : (key as string);

      return {
        column: header,
        width: columnWidths?.[index] ?? 20,
        type: String,
        value: (row: TData) => {
          const value = row[key];

          // Use custom formatter if available
          const keyString = String(key);
          if (keyString in formatters) {
            const formatter = (
              formatters as Record<
                string,
                (value: unknown, row: TData) => string | number
              >
            )[keyString];
            if (formatter) {
              return String(formatter(value, row));
            }
          }

          // Default formatting
          if (value === null || value === undefined) {
            return "";
          }

          // Handle dates
          if (value instanceof Date) {
            return value.toLocaleDateString();
          }

          // Handle date strings (ISO format)
          if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            const date = new Date(value);
            if (!Number.isNaN(date.getTime())) {
              return date.toLocaleDateString();
            }
          }

          // Return as-is for other types
          return String(value);
        },
      };
    });

    // Generate filename
    const defaultFilename = `export_${new Date().toISOString().split("T")[0]}`;
    const finalFilename = filename
      ? `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`
      : `${defaultFilename}.xlsx`;

    // Write file
    await writeXlsxFile(data, {
      schema,
      fileName: finalFilename,
      sheet: sheetName,
    });
  } catch (error) {
    console.error("Failed to export to Excel:", error);
    throw error;
  }
}
