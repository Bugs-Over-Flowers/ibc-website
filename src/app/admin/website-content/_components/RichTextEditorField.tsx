"use client";

import StandaloneRichTextEditor from "@/components/StandaloneRichTextEditor";

interface MarkdownTextareaProps {
  placeholder: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function MarkdownTextarea({
  placeholder,
  rows = 4,
  value,
  onChange,
  disabled = false,
  className,
}: MarkdownTextareaProps) {
  return (
    <div
      className={`space-y-2 ${className ?? ""} ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
      style={{ minHeight: `${rows * 24}px` }}
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
