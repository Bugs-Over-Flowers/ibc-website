import { Label } from "@/components/ui/label";
import { PaymentMethodEnum } from "@/lib/validation/utils";
import type { useRegistrationStep3 } from "../../../_hooks/useRegistrationStep3";
import PAYMENT_OPTIONS from "../../../_utils/paymentOptions";
import SelectionCardGroup from "../_utils/SelectionCardGroup";

interface Step3PaymentMethodSectionProps {
  form: ReturnType<typeof useRegistrationStep3>;
}

export default function Step3PaymentMethodSection({
  form,
}: Step3PaymentMethodSectionProps) {
  return (
    <form.AppField
      listeners={{
        onChange: () => {
          if (form.getFieldValue("paymentProofs")) {
            form.resetField("paymentProofs");
          }
        },
      }}
      name="paymentMethod"
    >
      {(field) => (
        <div className="space-y-4">
          <Label className="text-base">Payment Method</Label>
          <SelectionCardGroup
            onValueChange={(value) => {
              const parsedPaymentMethodValue =
                PaymentMethodEnum.safeParse(value);
              if (!parsedPaymentMethodValue.success) {
                return;
              }

              field.handleChange(parsedPaymentMethodValue.data);
            }}
            options={PAYMENT_OPTIONS}
            value={field.state.value}
          />
        </div>
      )}
    </form.AppField>
  );
}
