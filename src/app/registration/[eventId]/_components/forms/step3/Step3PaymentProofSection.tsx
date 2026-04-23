import type { useRegistrationStep3 } from "../../../_hooks/useRegistrationStep3";
import { PaymentProofDropzone } from "../RegistrationPayment";

interface Step3PaymentProofSectionProps {
  form: ReturnType<typeof useRegistrationStep3>;
}

export default function Step3PaymentProofSection({
  form,
}: Step3PaymentProofSectionProps) {
  return (
    <form.AppField name="paymentProof">
      {(field) => {
        const selectedFile = field.state.value as File | undefined;

        return (
          <PaymentProofDropzone
            errorMessages={field.state.meta.errors}
            onChange={(file) => field.handleChange(file)}
            value={selectedFile}
          />
        );
      }}
    </form.AppField>
  );
}
