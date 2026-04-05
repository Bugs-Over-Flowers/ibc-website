import { ChevronRight } from "lucide-react";
import StandaloneRichTextEditor from "@/components/StandaloneRichTextEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApplicationBadgeList } from "./ApplicationBadgeList";
import { InterviewDetailsCard } from "./InterviewDetailsCard";

interface Application {
  applicationId: string;
  companyName: string;
}

interface EditStepProps {
  applications: Application[];
  customMessage: string;
  interviewDate: Date | undefined;
  interviewVenue: string;
  onCustomMessageChange: (message: string) => void;
  onRemoveApplication: (applicationId: string) => void;
  onCancel: () => void;
  onNext: () => void;
}

export function EditStep({
  applications,
  customMessage,
  interviewDate,
  interviewVenue,
  onCustomMessageChange,
  onRemoveApplication,
  onCancel,
  onNext,
}: EditStepProps) {
  const plainMessage = customMessage
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const isMessageEmpty = plainMessage.length === 0;

  return (
    <>
      <div className="space-y-6">
        {/* Applications & Details */}
        <div className="space-y-6">
          {/* Selected Applications */}
          <ApplicationBadgeList
            applications={applications}
            onRemove={onRemoveApplication}
            showRemoveButton={true}
          />

          {/* Interview Details */}
          <InterviewDetailsCard
            interviewDate={interviewDate}
            interviewVenue={interviewVenue}
          />
        </div>

        {/* Custom Message */}
        <div className="flex flex-col gap-3">
          <Label className="font-medium" htmlFor="customMessage">
            Email Message
          </Label>
          <StandaloneRichTextEditor
            onChange={onCustomMessageChange}
            placeholder="Write your email message..."
            value={customMessage}
          />
          <p className="text-muted-foreground text-xs">
            Use the toolbar to format text with bold, italic, headings, and
            lists.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          className="active:scale-95 active:opacity-80"
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          className="active:scale-95 active:opacity-80"
          disabled={applications.length === 0 || isMessageEmpty}
          onClick={onNext}
          type="button"
        >
          Next: Preview <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
