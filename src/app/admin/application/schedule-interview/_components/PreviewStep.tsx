import { ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ApplicationBadgeList } from "./ApplicationBadgeList";

const INTERVIEW_DETAILS_TEMPLATE = `Interview Details:
Date & Time: {INTERVIEW_DATE}
Venue: {INTERVIEW_VENUE}`;

interface Application {
  applicationId: string;
  companyName: string;
}

interface PreviewStepProps {
  applications: Application[];
  customMessage: string;
  interviewDate: Date | undefined;
  interviewVenue: string;
  isPending: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function PreviewStep({
  applications,
  customMessage,
  interviewDate,
  interviewVenue,
  isPending,
  onBack,
  onSubmit,
}: PreviewStepProps) {
  const formattedDate = interviewDate
    ? new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(interviewDate)
    : "Not set";

  const getPreviewMessage = () => {
    const message = customMessage.trim();
    const details = INTERVIEW_DETAILS_TEMPLATE.replace(
      "{INTERVIEW_DATE}",
      formattedDate,
    ).replace("{INTERVIEW_VENUE}", interviewVenue || "Not set");

    // If no custom message, show only details
    if (!message) {
      return details;
    }

    const hasDatePlaceholder = message.includes("{INTERVIEW_DATE}");
    const hasVenuePlaceholder = message.includes("{INTERVIEW_VENUE}");

    // If message has placeholders, replace them
    if (hasDatePlaceholder || hasVenuePlaceholder) {
      return message
        .replace(/\{INTERVIEW_DATE\}/g, formattedDate)
        .replace(/\{INTERVIEW_VENUE\}/g, interviewVenue || "Not set");
    }

    // Otherwise, append details to ensure they're always shown
    return `${message}\n\n${details}`;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Recipients */}
        <div className="space-y-4">
          <ApplicationBadgeList applications={applications} />
        </div>

        {/* Message Preview */}
        <div className="flex flex-col gap-3">
          <Label className="font-medium">Email Message</Label>
          <Card className="flex-1 overflow-y-auto p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {getPreviewMessage()}
            </pre>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          className="active:scale-95 active:opacity-80"
          disabled={isPending}
          onClick={onBack}
          type="button"
          variant="outline"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          className="active:scale-95 active:opacity-80"
          disabled={
            isPending ||
            !interviewDate ||
            !interviewVenue ||
            applications.length === 0
          }
          onClick={onSubmit}
          type="button"
        >
          {isPending ? (
            "Sending..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Send Invitations
            </>
          )}
        </Button>
      </div>
    </>
  );
}
