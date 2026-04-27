"use client";

import StandaloneRichTextEditor from "@/components/StandaloneRichTextEditor";

interface MarkdownTextareaProps {
  placeholder: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function MarkdownTextarea({
  placeholder,
  rows,
  value,
  onChange,
  disabled = false,
}: MarkdownTextareaProps) {
  return (
    <div
      className={`space-y-2 ${disabled ? "pointer-events-none opacity-60" : ""}`}
      style={{ minHeight: rows ? `${Math.max(rows, 8) * 24}px` : undefined }}
    >
      <StandaloneRichTextEditor
        onChange={onChange}
        placeholder={placeholder}
        showHeadingTools={false}
        showListTools={false}
        value={value}
      />
    </div>
  );
}
