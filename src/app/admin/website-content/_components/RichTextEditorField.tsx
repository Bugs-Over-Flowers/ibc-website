"use client";

import StandaloneRichTextEditor from "@/components/StandaloneRichTextEditor";

interface MarkdownTextareaProps {
  placeholder: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownTextarea({
  placeholder,
  rows,
  value,
  onChange,
}: MarkdownTextareaProps) {
  return (
    <div
      className="space-y-2"
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
