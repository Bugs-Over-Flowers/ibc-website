import TermsAndConditions from "@/components/TermsAndConditions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { useRegistrationStep4 } from "../../../_hooks/useRegistrationStep4";

interface Step4TermsSectionProps {
  form: ReturnType<typeof useRegistrationStep4>;
}

export default function Step4TermsSection({ form }: Step4TermsSectionProps) {
  return (
    <form.AppField name="termsAndConditions">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <div className="rounded-xl border border-border/50 bg-background p-4">
            <Field orientation="horizontal">
              <Checkbox
                aria-invalid={isInvalid}
                checked={field.state.value}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onCheckedChange={(checked) =>
                  field.handleChange(checked === true)
                }
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm">I have read and agree to the</span>
                  <TermsAndConditions
                    customAcceptButton={(closeTermsAndConditions) => (
                      <Button
                        onClick={() => {
                          field.handleChange(true);
                          closeTermsAndConditions();
                        }}
                      >
                        Accept
                      </Button>
                    )}
                    triggerOverride={
                      <button
                        className={cn(
                          "text-sm",
                          "font-medium text-primary hover:underline",
                        )}
                        type="button"
                      >
                        Terms and Conditions.
                      </button>
                    }
                  />
                </div>
                <FieldError errors={field.state.meta.errors} />
              </div>
            </Field>
          </div>
        );
      }}
    </form.AppField>
  );
}
