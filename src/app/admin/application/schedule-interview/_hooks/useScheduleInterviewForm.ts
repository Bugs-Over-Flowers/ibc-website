import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMeetingSchedulerStore } from "../../_store/useMeetingSchedulerStore";
import { useSelectedApplicationsStore } from "../../_store/useSelectedApplicationsStore";

const DEFAULT_MESSAGE = `Dear Applicant,
We are pleased to inform you that your application has been reviewed. We would like to invite you to an interview to discuss your membership with the Iloilo Business Club.

Please confirm your attendance by replying to this email.

We look forward to meeting you.

Best regards,
Iloilo Business Club`;

interface Application {
  applicationId: string;
  companyName: string;
}

interface UseScheduleInterviewFormProps {
  applications: Application[];
  interviewDate: Date | undefined;
  interviewVenue: string;
  onSubmit: (
    customMessage: string,
    applicationIds: string[],
  ) => Promise<{ success: boolean }>;
}

export function useScheduleInterviewForm({
  applications,
  interviewDate: propInterviewDate,
  interviewVenue: propInterviewVenue,
  onSubmit,
}: UseScheduleInterviewFormProps) {
  const router = useRouter();
  const removeApplication = useSelectedApplicationsStore(
    (state) => state.removeApplication,
  );
  const clearSelection = useSelectedApplicationsStore(
    (state) => state.clearSelection,
  );
  const storeDate = useMeetingSchedulerStore((state) => state.interviewDate);
  const storeVenue = useMeetingSchedulerStore((state) => state.interviewVenue);
  const reset = useMeetingSchedulerStore((state) => state.reset);

  const hydratedStoreDate =
    typeof storeDate === "string" ? new Date(storeDate) : storeDate;
  const storeDateValid =
    hydratedStoreDate && !Number.isNaN(hydratedStoreDate.getTime());

  const [step, setStep] = useState<"edit" | "preview" | "success">("edit");
  const [customMessage, setCustomMessage] = useState(DEFAULT_MESSAGE);
  const [localApplications, setLocalApplications] = useState(applications);
  const [hasError, setHasError] = useState(false);

  const interviewDate =
    (storeDateValid ? hydratedStoreDate : undefined) ?? propInterviewDate;
  const interviewVenue = storeVenue ?? propInterviewVenue;

  useEffect(() => {
    setLocalApplications(applications);
    setStep("edit");
    setHasError(false);
    setCustomMessage(DEFAULT_MESSAGE);
  }, [applications]);

  const handleRemoveApplication = (applicationId: string) => {
    setLocalApplications((prev) =>
      prev.filter((app) => app.applicationId !== applicationId),
    );
    removeApplication(applicationId);
  };

  const handleNext = () => {
    if (localApplications.length === 0) {
      return;
    }
    setStep("preview");
  };

  const handleBack = () => {
    setStep("edit");
  };

  const handleSubmit = async () => {
    if (!interviewDate || !interviewVenue || localApplications.length === 0) {
      return;
    }
    const finalMessage = customMessage.trim();
    const applicationIds = localApplications.map((app) => app.applicationId);

    const result = await onSubmit(finalMessage, applicationIds);

    if (result.success) {
      setHasError(false);
    } else {
      setHasError(true);
    }

    if (result.success) {
      clearSelection();
      reset();
    }

    setStep("success");
  };

  const handleCancel = () => {
    router.back();
  };

  return {
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
  };
}

export { DEFAULT_MESSAGE };
