import z from "zod";
import { useAppForm } from "@/hooks/_formHooks";
import { useCheckInStore } from "./useCheckInStore.store";

interface UseSetRemarksProps {
  remarks: string | null;
  participantId: string;
  setOpen: (open: boolean) => void;
}

export const useSetRemarks = ({
  remarks,
  participantId,
  setOpen,
}: UseSetRemarksProps) => {
  const updateRemarks = useCheckInStore((state) => state.updateRemarks);
  const form = useAppForm({
    defaultValues: {
      remarks: remarks,
    },
    validators: {
      onSubmit: z.object({
        remarks: z.string().nullable(),
      }),
    },
    onSubmit: async ({ value }) => {
      updateRemarks({
        [participantId]: value.remarks,
      });
      setOpen(false);
    },
  });

  return form;
};
