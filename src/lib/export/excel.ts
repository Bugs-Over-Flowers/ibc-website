"use client";

import type { ColumnDef } from "@tanstack/react-table";
import writeXlsxFile from "write-excel-file/browser";

type CellValue = string | number | boolean | Date | null | undefined;

export interface ExportEventDetails {
  title: string;
  dayLabel?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  venue?: string | null;
}

export interface ExportToExcelOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  event: ExportEventDetails;
  filename?: string;
  sheetName?: string;
  excludeColumns?: string[];
  formatters?: Partial<
    Record<keyof TData, (value: unknown, row: TData) => string | number>
  >;
  columnWidths?: number[];
}

export async function exportToExcel<TData extends Record<string, unknown>>(
  options: ExportToExcelOptions<TData>,
): Promise<void> {
  const {
    data,
    columns,
    event,
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

    const totalColumns = exportableColumns.length;
    if (totalColumns === 0) {
      return;
    }

    const formattersByKey = formatters as Record<
      string,
      (value: unknown, row: TData) => string | number
    >;

    const getCellValue = (row: TData, key: string): CellValue => {
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

      return value as CellValue;
    };

    const subtitle:
      | { type: "plain"; value: string }
      | { type: "labeled"; label: string; value: string }
      | null = event.dayLabel
      ? { type: "plain", value: event.dayLabel }
      : (() => {
          if (!event.startDate && !event.endDate) {
            return null;
          }
          const start = event.startDate
            ? new Date(event.startDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : null;
          const end = event.endDate
            ? new Date(event.endDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : null;
          if (start && end) {
            return start === end
              ? { type: "labeled", label: "Date", value: start }
              : { type: "labeled", label: "Dates", value: `${start} — ${end}` };
          }
          return {
            type: "labeled",
            label: "Date",
            value: (start ?? end) || "",
          };
        })();

    const renderLabeledRow = (label: string, value: string) => [
      { value: label, fontWeight: "bold" as const },
      ...(totalColumns > 1
        ? [{ value, span: totalColumns - 1, align: "left" as const }]
        : []),
    ];

    const exportType = sheetName !== "Sheet1" ? sheetName : "Export";
    const generatedAt = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const sheetData = [
      // Row 1: Event title
      [
        {
          value: event.title,
          fontWeight: "bold" as const,
          fontSize: 20,
          span: totalColumns,
        },
      ],
      // Row 2: Subtitle (day label or date range)
      ...(subtitle
        ? [
            subtitle.type === "plain"
              ? [{ value: subtitle.value, span: totalColumns }]
              : renderLabeledRow(subtitle.label, subtitle.value),
          ]
        : []),
      // Row 3: Venue (if present)
      ...(event.venue ? [renderLabeledRow("Venue", event.venue)] : []),
      // Row 4: Export type
      [
        {
          value: exportType,
          fontWeight: "bold" as const,
          fontSize: 14,
          span: totalColumns,
        },
      ],
      // Row 5: Generated timestamp
      [
        {
          value: `Generated: ${generatedAt}`,
          span: totalColumns,
        },
      ],
      // Row 6: Empty spacer
      new Array(totalColumns).fill(null),
      // Column headers (styled: dark blue + bold)
      exportableColumns.map((column) => ({
        value: column.header,
        fontWeight: "bold",
        backgroundColor: "#b8cbd9",
      })),
      // Data rows
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
