"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import type { VisionMissionSectionProps } from "../../_types/sectionProps";
import { MarkdownTextarea } from "../RichTextEditorField";

export function VisionMissionSection({
  visionParagraph,
  missionParagraph,
  placeholders,
  onVisionParagraphChange,
  onMissionParagraphChange,
}: VisionMissionSectionProps) {
  const form = useForm({
    defaultValues: {
      visionParagraph,
      missionParagraph,
    },
  });

  useEffect(() => {
    form.setFieldValue("visionParagraph", visionParagraph);
    form.setFieldValue("missionParagraph", missionParagraph);
  }, [form, missionParagraph, visionParagraph]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border p-4">
        <div className="space-y-2">
          <p className="font-medium text-sm">Vision Paragraph</p>
          <form.Field name="visionParagraph">
            {(field) => (
              <MarkdownTextarea
                onChange={(value) => {
                  field.handleChange(value);
                  onVisionParagraphChange(value);
                }}
                placeholder={
                  placeholders.visionParagraph || "Enter the vision paragraph"
                }
                rows={12}
                value={field.state.value}
              />
            )}
          </form.Field>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="space-y-2">
          <p className="font-medium text-sm">Mission Paragraph</p>
          <form.Field name="missionParagraph">
            {(field) => (
              <MarkdownTextarea
                onChange={(value) => {
                  field.handleChange(value);
                  onMissionParagraphChange(value);
                }}
                placeholder={
                  placeholders.missionParagraph || "Enter the mission paragraph"
                }
                rows={12}
                value={field.state.value}
              />
            )}
          </form.Field>
        </div>
      </div>
    </div>
  );
}
