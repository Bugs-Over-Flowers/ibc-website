import { AlertCircle } from "lucide-react";
import type { CreateSREventOption } from "./types";

interface CreateSRFeePreviewProps {
  event: CreateSREventOption;
  feeDeduction: number;
}

export function CreateSRFeePreview({
  event,
  feeDeduction,
}: CreateSRFeePreviewProps) {
  if (feeDeduction <= 0) {
    return null;
  }

  if (feeDeduction > event.registrationFee) {
    return (
      <div className="fade-in slide-in-from-top-2 animate-in duration-200">
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-destructive">
              Fee deduction exceeds event registration fee
            </p>
            <p className="mt-1 text-destructive/90">
              {`Deduction (PHP ${feeDeduction.toLocaleString()}) cannot exceed event fee (PHP ${event.registrationFee.toLocaleString()}).`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in slide-in-from-top-2 animate-in rounded-xl border border-border/50 bg-muted/20 p-4 duration-200">
      <h3 className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
        Fee Preview
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Original Fee</span>
          <span>{`PHP ${event.registrationFee.toLocaleString()}`}</span>
        </div>
        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
          <span>Sponsor Discount</span>
          <span>{`- PHP ${feeDeduction.toLocaleString()}`}</span>
        </div>
        <div className="flex items-center justify-between border-border/50 border-t pt-2 font-semibold">
          <span>Final Price for Guest</span>
          <span>{`PHP ${Math.max(0, event.registrationFee - feeDeduction).toLocaleString()}`}</span>
        </div>
      </div>
    </div>
  );
}
