import { Send, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SuccessStepProps {
  applicationCount: number;
  hasError?: boolean;
}

export function SuccessStep({
  applicationCount,
  hasError = false,
}: SuccessStepProps) {
  const router = useRouter();

  const handleReturnToApplications = () => {
    router.push("/admin/application");
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <div className="text-center">
          <h2 className="mb-2 font-semibold text-xl">Failed to Send Emails</h2>
          <p className="text-muted-foreground">
            There was an error sending the interview invitations. Please try
            again or contact support.
          </p>
        </div>
        <Button onClick={handleReturnToApplications} size="lg">
          Return to Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <Send className="h-10 w-10 text-green-600" />
      </div>
      <div className="text-center">
        <h2 className="mb-2 font-semibold text-xl">
          Emails Sent Successfully!
        </h2>
        <p className="text-muted-foreground">
          Interview invitations have been sent to {applicationCount} applicant
          {applicationCount !== 1 ? "s" : ""}.
        </p>
      </div>
      <Button onClick={handleReturnToApplications} size="lg">
        Return to Applications
      </Button>
    </div>
  );
}
