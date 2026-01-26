import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
          <Textarea
            className="flex-1 resize-none text-sm"
            id="customMessage"
            onChange={(e) => onCustomMessageChange(e.target.value)}
            value={customMessage}
          />
          <p className="text-muted-foreground text-xs">
            Edit the message as needed or use the default template.
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
          disabled={applications.length === 0}
          onClick={onNext}
          type="button"
        >
          Next: Preview <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
