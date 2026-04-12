"use client";

import type { VisionMissionSectionProps } from "../../_types/section-props";
import { MarkdownTextarea } from "../RichTextEditorField";

export function VisionMissionSection({
  visionParagraph,
  missionParagraph,
  placeholders,
  onVisionParagraphChange,
  onMissionParagraphChange,
}: VisionMissionSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border p-4">
        <div className="space-y-2">
          <p className="font-medium text-sm">Vision Paragraph</p>
          <MarkdownTextarea
            onChange={onVisionParagraphChange}
            placeholder={
              placeholders.visionParagraph || "Enter the vision paragraph"
            }
            rows={12}
            value={visionParagraph}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="space-y-2">
          <p className="font-medium text-sm">Mission Paragraph</p>
          <MarkdownTextarea
            onChange={onMissionParagraphChange}
            placeholder={
              placeholders.missionParagraph || "Enter the mission paragraph"
            }
            rows={12}
            value={missionParagraph}
          />
        </div>
      </div>
    </div>
  );
}
