import { Badge } from "@/components/ui/badge";
import { DetailRow } from "./DetailRow";

interface PaymentInfoCardProps {
  paymentMethod: string;
  paymentProofStatus: string;
  applicationDate: Date;
}

export function PaymentInfoCard({
  paymentMethod,
  paymentProofStatus,
  applicationDate,
}: PaymentInfoCardProps) {
  const normalizedStatus = paymentProofStatus.toLowerCase();
  const statusClassName =
    normalizedStatus === "accepted"
      ? "bg-status-green"
      : normalizedStatus === "rejected"
        ? "bg-status-red"
        : "bg-status-orange";

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h2 className="font-semibold leading-none tracking-tight">
          Payment Information
        </h2>
      </div>
      <div className="grid gap-4 p-6 pt-0">
        <DetailRow label="Payment Method" value={paymentMethod} />
        <DetailRow
          label="Payment Status"
          value={
            <Badge
              className={statusClassName}
              variant={
                normalizedStatus === "accepted" ? "default" : "secondary"
              }
            >
              {paymentProofStatus}
            </Badge>
          }
        />
        <DetailRow
          label="Application Date"
          value={applicationDate.toLocaleDateString()}
        />
      </div>
    </div>
  );
}
