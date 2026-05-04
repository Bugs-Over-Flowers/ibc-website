import Image from "next/image";

interface IBCPaymentInfoProps {
  showHeader?: boolean;
  className?: string;
}

export default function IBCPaymentInfo({
  showHeader = true,
  className,
}: IBCPaymentInfoProps) {
  return (
    <div className={className}>
      {showHeader && (
        <p className="mb-1 text-muted-foreground text-xs">
          Use your registration ID as payment reference
        </p>
      )}

      <div className="space-y-4">
        <div className="mx-auto flex w-full max-w-[220px] flex-col items-center gap-2 rounded-lg border border-border/40 bg-background/50 p-3">
          <Image
            alt="IBC bank transfer QR code"
            className="h-auto w-full rounded-md border border-border/40 bg-white object-contain"
            height={200}
            src="/info/sampleqr.jpeg"
            width={200}
          />
          <p className="text-center text-muted-foreground text-xs">
            Scan to transfer via BPI
          </p>
        </div>

        <div className="space-y-2 rounded-lg border border-border/40 bg-background/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Bank</span>
            <span className="font-medium text-foreground">
              (BPI) Bank of the Philippine Islands
            </span>
          </div>
          <div className="border-border/20 border-t" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Account Number</span>
            <span className="font-medium font-mono text-foreground">
              000XXXXXXXX
            </span>
          </div>
          <div className="border-border/20 border-t" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Account Name</span>
            <span className="font-medium text-foreground">
              Iloilo Business Club
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
