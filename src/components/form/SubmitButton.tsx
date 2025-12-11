import { useFormContext } from "@/hooks/_formHooks";
import { Button } from "../ui/button";

interface SubmitButtonProps {
  label: string;
  isSubmittingLabel: string;
}

export default function SubmitButton({
  label,
  isSubmittingLabel,
}: SubmitButtonProps) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(s) => [s.isSubmitting, s.isValid]}>
      {([isSubmitting, isValid]) => (
        <Button disabled={isSubmitting || !isValid}>
          {isSubmitting ? isSubmittingLabel : label}
        </Button>
      )}
    </form.Subscribe>
  );
}
