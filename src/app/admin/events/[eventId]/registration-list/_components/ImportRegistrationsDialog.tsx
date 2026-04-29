"use client";

import { Copy, FileText, Upload, X } from "lucide-react";
import { type DragEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { cn } from "@/lib/utils";
import {
  IMPORT_REGISTRATIONS_MAX_ROWS,
  type ImportEventRegistrationRowResult,
  type ImportRegistrationRowPayload,
} from "@/lib/validation/registration/importRegistrations";
import { importEventRegistrationsRPC } from "@/server/registration/mutations/importEventRegistrationsRPC";

type ImportRegistrationsDialogProps = {
  eventId: string;
};

const EXPECTED_HEADERS = [
  "first_name",
  "last_name",
  "email",
  "contact_number",
  "affiliation",
  "note",
  "source_submission_id",
  "source_submitted_at",
] as const;

const REQUIRED_HEADERS = [
  "first_name",
  "last_name",
  "email",
  "contact_number",
  "affiliation",
] as const;

const OPTIONAL_HEADERS = [
  "note",
  "source_submission_id",
  "source_submitted_at",
] as const;

const GOOGLE_SHEETS_TEMPLATE_FORMULA = `={
"Questions","Desc","Image","Type","Required","option start","option 2","option 3","option end","Other","Points","Correct Answer","correct feedback","correct url","incorrect feedback","incorrect url";
"Registration Import Form","","","TITLE","","","","","","","","","","","","";
"Participant Information","One participant per registration. This form is for CSV import to IBC admin.","","SECTION_HEADER","","","","","","","","","","","","";
"first_name","Required. Participant first name.","","TEXT","TRUE","","","","","","","","","","","";
"last_name","Required. Participant last name.","","TEXT","TRUE","","","","","","","","","","","";
"email","Required. Valid email address.","","TEXT","TRUE","","","","","","","","","","","";
"contact_number","Required. Mobile or landline.","","TEXT","TRUE","","","","","","","","","","","";
"affiliation","Required. Company/organization/affiliation.","","TEXT","TRUE","","","","","","","","","","","";
"note","Optional admin note.","","PARAGRAPH","FALSE","","","","","","","","","","","";
"source_submission_id","Optional unique external response ID (for dedupe).","","TEXT","FALSE","","","","","","","","","","","";
"source_submitted_at","Optional ISO timestamp (example: 2026-05-01T09:00:00+08:00).","","TEXT","FALSE","","","","","","","","","","",""
}`;

type ParsedCsv = {
  rows: ImportRegistrationRowPayload[];
  totalRows: number;
};

export default function ImportRegistrationsDialog({
  eventId,
}: ImportRegistrationsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rows, setRows] = useState<ImportRegistrationRowPayload[]>([]);
  const [result, setResult] = useState<{
    dryRun: boolean;
    total: number;
    valid: number;
    invalid: number;
    wouldInsert: number;
    inserted: number;
    skippedDuplicate: number;
    failed: number;
    results: ImportEventRegistrationRowResult[];
  } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const { execute, isPending } = useAction(
    tryCatch(importEventRegistrationsRPC),
    {
      onSuccess: (data) => {
        setResult((prev) => ({
          dryRun: prev?.dryRun ?? false,
          ...data,
        }));
        if (data.inserted > 0) {
          toast.success(`Imported ${data.inserted} registration(s).`);
        }
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  const resetState = () => {
    setSelectedFileName(null);
    setSelectedFileSize(null);
    setFileError(null);
    setIsDragging(false);
    setRows([]);
    setResult(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(
        `${label} copied. Paste on the first cell of your Google Sheet.`,
      );
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}.`);
    }
  };

  const parseCsv = (text: string): ParsedCsv => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      throw new Error("CSV must include headers and at least one data row.");
    }

    const [headerLine, ...dataLines] = lines;
    const headers = splitCsvLine(headerLine).map((value) =>
      value.toLowerCase(),
    );

    const missingHeaders = EXPECTED_HEADERS.filter(
      (header) => !headers.includes(header),
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(", ")}`);
    }

    if (dataLines.length > IMPORT_REGISTRATIONS_MAX_ROWS) {
      throw new Error(
        `Maximum of ${IMPORT_REGISTRATIONS_MAX_ROWS} rows per import. Received ${dataLines.length}.`,
      );
    }

    const rows = dataLines.map((line) => {
      const values = splitCsvLine(line);
      const getValue = (key: (typeof EXPECTED_HEADERS)[number]) => {
        const idx = headers.indexOf(key);
        if (idx < 0 || idx >= values.length) {
          return undefined;
        }

        const value = values[idx]?.trim();
        return value ? value : undefined;
      };

      return {
        first_name: getValue("first_name"),
        last_name: getValue("last_name"),
        email: getValue("email"),
        contact_number: getValue("contact_number"),
        affiliation: getValue("affiliation"),
        note: getValue("note"),
        source_submission_id: getValue("source_submission_id"),
        source_submitted_at: getValue("source_submitted_at"),
      } satisfies ImportRegistrationRowPayload;
    });

    return {
      rows,
      totalRows: dataLines.length,
    };
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    setFileError(null);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      const message = "Please upload a CSV file.";
      setFileError(message);
      toast.error(message);
      return;
    }

    try {
      const parsed = parseCsv(await file.text());
      setRows(parsed.rows);
      setSelectedFileName(file.name);
      setSelectedFileSize(file.size);
      setResult(null);
      toast.success(`Loaded ${parsed.totalRows} row(s) from CSV.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid CSV file.";
      setFileError(message);
      toast.error(message);
    }
  };

  const clearLoadedFile = () => {
    setSelectedFileName(null);
    setSelectedFileSize(null);
    setFileError(null);
    setRows([]);
    setResult(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleDrop = async (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await handleFileUpload(event.dataTransfer.files?.[0] ?? null);
  };

  const runImport = async (dryRun: boolean) => {
    if (rows.length === 0) {
      toast.error("Upload a CSV file before running import.");
      return;
    }

    const response = await execute({
      eventId,
      dryRun,
      rows,
    });

    if (!response.success) {
      return;
    }

    setResult({
      dryRun,
      ...response.data,
    });

    if (dryRun) {
      toast.success("Validation completed.");
      return;
    }

    if (response.data.inserted > 0) {
      window.location.reload();
    }
  };

  return (
    <>
      <Button
        className="gap-2"
        onClick={() => setOpen(true)}
        size="sm"
        variant="outline"
      >
        <Upload className="size-3.5" />
        Import CSV
      </Button>

      <Dialog
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            resetState();
          }
        }}
        open={open}
      >
        <DialogContent className="max-h-[95vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-y-auto overflow-x-hidden sm:w-[min(1024px,calc(100vw-3rem))] sm:max-w-[min(1024px,calc(100vw-3rem))]">
          <DialogHeader>
            <DialogTitle>Import Registrations</DialogTitle>
            <DialogDescription>
              Upload a Google Forms CSV export with one participant per
              registration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-md border bg-muted/30 p-2.5 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">CSV schema</p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Include all headers exactly as shown. Optional columns may
                    be left blank.
                  </p>
                </div>
                <div className="flex min-w-0 flex-wrap gap-2 max-sm:w-full max-sm:*:flex-1">
                  <Button
                    className="h-7 gap-1.5 px-2 text-xs"
                    onClick={() => {
                      void copyToClipboard(
                        GOOGLE_SHEETS_TEMPLATE_FORMULA,
                        "Google Sheets template",
                      );
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Copy className="size-3" />
                    Copy Headers
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <div className="rounded-md border bg-background/70 p-3">
                  <p className="font-medium text-xs uppercase tracking-wide">
                    Required
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {REQUIRED_HEADERS.map((header) => (
                      <span
                        className="max-w-full break-all rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]"
                        key={header}
                      >
                        {header}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border bg-background/70 p-3">
                  <p className="font-medium text-xs uppercase tracking-wide">
                    Optional values
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {OPTIONAL_HEADERS.map((header) => (
                      <span
                        className="max-w-full break-all rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]"
                        key={header}
                      >
                        {header}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-md border bg-background/70 p-3">
                <p className="font-medium text-xs uppercase tracking-wide">
                  Format hints
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border bg-muted/50 px-2 py-0.5">
                    email: name@domain.com
                  </span>
                  <span className="max-w-full break-all rounded-full border bg-muted/50 px-2 py-0.5">
                    source_submitted_at: 2026-05-01T09:00:00+08:00
                  </span>
                  <span className="rounded-full border bg-muted/50 px-2 py-0.5">
                    Max {IMPORT_REGISTRATIONS_MAX_ROWS} rows
                  </span>
                </div>
              </div>
            </div>

            <input
              accept=".csv"
              className="sr-only"
              onChange={(event) => {
                void handleFileUpload(event.target.files?.[0] ?? null);
              }}
              ref={fileRef}
              type="file"
            />

            <button
              className={cn(
                "rounded-lg border-2 border-dashed p-5 text-center transition-colors",
                isDragging &&
                  "border-primary bg-primary/10 ring-2 ring-primary/20",
                fileError && "border-destructive bg-destructive/5",
                !isDragging &&
                  !fileError &&
                  "border-border/70 bg-muted/10 hover:border-primary/40",
              )}
              onClick={() => fileRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDrop={(event) => {
                void handleDrop(event);
              }}
              type="button"
            >
              <Upload className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="font-medium text-sm">Drag and drop your CSV here</p>
              <p className="mt-1 text-muted-foreground text-xs">
                or click to browse files
              </p>
            </button>

            {fileError && (
              <p className="text-destructive text-xs">{fileError}</p>
            )}

            {selectedFileName && (
              <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-medium text-sm">
                    <FileText className="size-3.5" />
                    <span className="truncate">{selectedFileName}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {selectedFileSize !== null
                      ? formatBytes(selectedFileSize)
                      : "CSV file"}
                  </p>
                </div>
                <Button
                  className="h-7 w-7"
                  onClick={clearLoadedFile}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-3.5" />
                  <span className="sr-only">Clear file</span>
                </Button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border bg-muted/50 px-2.5 py-1 text-xs">
                File: {selectedFileName ?? "none"}
              </span>
              <span className="rounded-full border bg-muted/50 px-2.5 py-1 text-xs">
                Rows: {rows.length}
              </span>
            </div>

            {result && (
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <ResultStat label="Total" value={result.total} />
                  <ResultStat label="Valid" value={result.valid} />
                  <ResultStat label="Invalid" value={result.invalid} />
                  <ResultStat label="Would Insert" value={result.wouldInsert} />
                  <ResultStat label="Inserted" value={result.inserted} />
                  <ResultStat
                    label="Skipped Duplicate"
                    value={result.skippedDuplicate}
                  />
                </div>

                <div className="max-h-64 overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.results.slice(0, 50).map((entry) => (
                        <TableRow key={`${entry.rowNumber}-${entry.status}`}>
                          <TableCell>{entry.rowNumber}</TableCell>
                          <TableCell className="uppercase">
                            {entry.status}
                          </TableCell>
                          <TableCell className="max-w-[420px] whitespace-normal text-xs">
                            {entry.errors?.join("; ") ||
                              entry.warnings?.join("; ") ||
                              entry.sourceSubmissionId ||
                              "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {result.results.length > 50 && (
                  <p className="text-muted-foreground text-xs">
                    Showing first 50 row results.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={resetState} type="button" variant="outline">
              Clear
            </Button>
            <Button
              disabled={isPending || rows.length === 0}
              onClick={() => {
                void runImport(true);
              }}
              type="button"
              variant="outline"
            >
              {isPending ? "Working..." : "Validate CSV"}
            </Button>
            <Button
              disabled={isPending || rows.length === 0}
              onClick={() => {
                void runImport(false);
              }}
              type="button"
            >
              {isPending ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
