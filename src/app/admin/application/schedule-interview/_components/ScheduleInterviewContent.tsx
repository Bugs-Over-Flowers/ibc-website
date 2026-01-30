"use client";

import { useScheduleInterviewForm } from "../_hooks/useScheduleInterviewForm";
import { EditStep } from "./EditStep";
import { PreviewStep } from "./PreviewStep";
import { SuccessStep } from "./SuccessStep";

interface ScheduleInterviewPageProps {
  onSubmit: (
    customMessage: string,
    applicationIds: string[],
  ) => Promise<{ success: boolean }>;
  isPending: boolean;
  applications: Array<{
    applicationId: string;
    companyName: string;
  }>;
  interviewDate: Date | undefined;
  interviewVenue: string;
}

export function ScheduleInterviewContent({
  onSubmit,
  isPending,
  applications,
  interviewDate: _interviewDate,
  interviewVenue: _interviewVenue,
}: ScheduleInterviewPageProps) {
  const {
    step,
    customMessage,
    setCustomMessage,
    localApplications,
    interviewDate,
    interviewVenue,
    hasError,
    handleRemoveApplication,
    handleNext,
    handleBack,
    handleSubmit,
    handleCancel,
  } = useScheduleInterviewForm({
    applications,
    interviewDate: _interviewDate,
    interviewVenue: _interviewVenue,
    onSubmit,
  });

  const isError = step === "success" && hasError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">
          {step === "edit"
            ? "Customize Interview Invitation"
            : step === "preview"
              ? "Preview Interview Invitation"
              : isError
                ? "Failed to Send Emails"
                : "Email Sent Successfully!"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {step === "edit"
            ? "Edit the message and manage selected applications before sending"
            : step === "preview"
              ? `Review the email before sending to ${localApplications.length} application${
                  localApplications.length !== 1 ? "s" : ""
                }`
              : isError
                ? "There was an error sending the interview invitations. Please try again or contact support."
                : `Interview invitations have been sent to ${localApplications.length} application${
                    localApplications.length !== 1 ? "s" : ""
                  }`}
        </p>
      </div>

      {step === "success" ? (
        <SuccessStep
          applicationCount={localApplications.length}
          hasError={hasError}
        />
      ) : step === "edit" ? (
        <EditStep
          applications={localApplications}
          customMessage={customMessage}
          interviewDate={interviewDate}
          interviewVenue={interviewVenue}
          onCancel={handleCancel}
          onCustomMessageChange={setCustomMessage}
          onNext={handleNext}
          onRemoveApplication={handleRemoveApplication}
        />
      ) : (
        <PreviewStep
          applications={localApplications}
          customMessage={customMessage}
          interviewDate={interviewDate}
          interviewVenue={interviewVenue}
          isPending={isPending}
          onBack={handleBack}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
