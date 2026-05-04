import { Card, CardContent } from "@/components/ui/card";
import type { useRegistrationStep4 } from "../../../_hooks/useRegistrationStep4";

interface NoteSectionProps {
  form: ReturnType<typeof useRegistrationStep4>;
}

export default function NoteSection({ form }: NoteSectionProps) {
  return (
    <Card className="rounded-2xl border border-border/50 bg-background">
      <CardContent>
        <form.AppField name="note">
          {(field) => (
            <field.TextareaField
              description="This field is optional. You may add additional context to your registration. Eg. registering for day 1 only. etc."
              label="Note"
            />
          )}
        </form.AppField>
      </CardContent>
    </Card>
  );
}
