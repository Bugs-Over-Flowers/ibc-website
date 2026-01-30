"use client";

import { CheckCircle2, ClipboardCopy, Info } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import ResetMembershipApplicationWrapper from "@/app/membership/application/success/_components/ResetMembershipApplicationWrapper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function SuccessContent() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get("id") ?? "";
  const [copied, setCopied] = useState(false);

  const handleCopyIdentifier = async () => {
    if (!identifier) return;

    try {
      await navigator.clipboard.writeText(identifier);
      setCopied(true);
      toast.success("Application ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4 sm:max-w-lg sm:space-y-6">
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-green-100 p-4 text-green-600 sm:mb-6 sm:p-6 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12" />
          </div>
          <h1 className="mb-2 font-bold text-2xl sm:text-3xl">
            Application Submitted!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Thank you for applying for membership at Iloilo Business Club. We
            have received your application and will review it shortly.
          </p>
        </div>

        {/* Application Identifier Card */}
        {identifier && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <p className="mb-2 font-medium text-muted-foreground text-xs sm:text-sm">
                    Your Application ID
                  </p>
                  <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                    <code className="rounded-md bg-background px-3 py-2 font-mono font-semibold text-sm tracking-wider sm:px-4 sm:text-lg">
                      {identifier}
                    </code>
                    <Button
                      className="shrink-0"
                      onClick={handleCopyIdentifier}
                      size="icon"
                      variant="outline"
                    >
                      <ClipboardCopy
                        className={`h-4 w-4 ${copied ? "text-green-500" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Important Information Alert */}
        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 text-sm sm:text-base dark:text-amber-300">
            Save Your Application ID
          </AlertTitle>
          <AlertDescription className="text-amber-700 text-xs sm:text-sm dark:text-amber-400">
            Please save your Application ID for future reference. You can use it
            to track the status of your application. To check your application
            status, visit the{" "}
            <Link
              className="font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
              href="/members"
            >
              Members page
            </Link>{" "}
            and look for the &quot;Check Application Status&quot; button at the
            bottom of the page.
          </AlertDescription>
        </Alert>

        {/* Email Notification */}
        <p className="text-center text-muted-foreground text-xs sm:text-sm">
          You will also receive an email confirmation with your application
          details and updates regarding your application status.
        </p>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <Link
            className="w-full sm:w-auto"
            href="/membership/check-application-status"
          >
            <Button className="w-full" size="lg">
              Check Application Status
            </Button>
          </Link>
          <Link className="w-full sm:w-auto" href="/">
            <Button className="w-full" size="lg" variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MembershipSuccessPage() {
  return (
    <ResetMembershipApplicationWrapper>
      <Suspense
        fallback={
          <div className="flex min-h-screen w-full flex-col items-center justify-center px-4">
            <div className="animate-pulse text-muted-foreground text-sm sm:text-base">
              Loading...
            </div>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </ResetMembershipApplicationWrapper>
  );
}
