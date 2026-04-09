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
} from "@/lib/validation/registration/quickRegistration";
import { quickOnsiteRegistrationRPC } from "@/server/registration/mutations/quickOnsiteRegistrationRPC";

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
      quickOnsiteRegistrationRPC(payload),
    ),
    {
      onError: (error) => {
        toast.error(error);
      },
      onSuccess: ({ rpcResults, identifier }) => {
        toast.success("Registration and check-in complete", {
          description: `${rpcResults.message} ${identifier}`,
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
      const payload: QuickOnsiteRegistrationInput = {
        eventDayId,
        eventId,
        memberDetails:
          parsedValue.member === "member"
            ? {
                member: "member" as const,
                businessMemberId: parsedValue.businessMemberId ?? "",
              }
            : {
                member: "nonmember" as const,
                nonMemberName: parsedValue.nonMemberName ?? "",
              },
        registrant: {
          id: crypto.randomUUID(),
          firstName: parsedValue.firstName,
          lastName: parsedValue.lastName,
          email: parsedValue.email,
          contactNumber: parsedValue.contactNumber,
        },

        remark: parsedValue.remark?.trim() || undefined,
      };

      const result = await quickRegistration(payload);

      if (!result.success) {
        formApi.setErrorMap({
          onSubmit: {
            form: String(result.error),
            fields: {},
          },
        });
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
