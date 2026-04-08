import { revalidateLogic } from "@tanstack/react-form";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/_formHooks";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { zodValidator } from "@/lib/utils";
import {
  type QuickOnsiteRegistrationForm,
  QuickOnsiteRegistrationFormSchema,
  type QuickOnsiteRegistrationInput,
} from "@/lib/validation/registration/quickOnsite";
import { createQuickOnsiteRegistration } from "@/server/registration/mutations/createQuickOnsiteRegistration";

type QuickOnsiteSubmitMeta = {
  keepOpen: boolean;
};

const DEFAULT_SUBMIT_META: QuickOnsiteSubmitMeta = {
  keepOpen: false,
};

interface QuickRegistrationProps {
  defaultValues?: QuickOnsiteRegistrationForm;
  eventDayId: string;
  eventId: string;
  setDialogOpen: (open: boolean) => void;
}

const useQuickRegistration = ({
  defaultValues,
  eventDayId,
  setDialogOpen,
  eventId,
}: QuickRegistrationProps) => {
  const { execute: quickRegistration } = useAction(
    tryCatch((payload: QuickOnsiteRegistrationInput) =>
      createQuickOnsiteRegistration(payload),
    ),
    {
      onError: (error) => {
        toast.error(error);
      },
      onSuccess: ({ checkedInCount, identifier }) => {
        toast.success("Registration and Check in complete", {
          description: `${checkedInCount} participant(s) checked in. ${identifier}`,
        });
      },
    },
  );
  return useAppForm({
    defaultValues,
    validationLogic: revalidateLogic({ mode: "submit" }),
    validators: {
      onDynamic: zodValidator(QuickOnsiteRegistrationFormSchema),
    },
    onSubmitMeta: DEFAULT_SUBMIT_META,
    onSubmit: async ({ value, meta, formApi }) => {
      const parsedValue = QuickOnsiteRegistrationFormSchema.parse(value);
      const payload = {
        eventDayId,
        eventId,
        step1:
          parsedValue.member === "member"
            ? {
                member: "member" as const,
                businessMemberId: parsedValue.businessMemberId ?? "",
              }
            : {
                member: "nonmember" as const,
                nonMemberName: parsedValue.nonMemberName ?? "",
              },
        step2: {
          registrant: {
            id: crypto.randomUUID(),
            firstName: parsedValue.firstName,
            lastName: parsedValue.lastName,
            email: parsedValue.email,
            contactNumber: parsedValue.contactNumber,
          },
          otherParticipants: [],
        },
        remark: parsedValue.remark?.trim() || undefined,
      };

      const result = await quickRegistration(payload);

      if (!result.success) {
        return;
      }

      formApi.reset(defaultValues);

      if (!meta.keepOpen) {
        setDialogOpen(false);
      }
    },
  });
};

export default useQuickRegistration;
