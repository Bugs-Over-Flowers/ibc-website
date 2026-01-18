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
  const setNewRemarks = useCheckInStore((state) => state.setNewRemarks);
  const form = useAppForm({
    defaultValues: {
      remarks: remarks,
    },
    validators: {
      onSubmit: z.object({
        remarks: z.string().nullable(),
      }),
    },
    onSubmit: ({ value }) => {
      setNewRemarks({
        [participantId]: value.remarks,
      });

      setOpen(false);
    },
  });

  return form;
};
