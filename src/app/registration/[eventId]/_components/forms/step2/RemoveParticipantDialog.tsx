import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useFieldContext } from "@/hooks/_formHooks";

export function RemoveParticipantDialog({ idx }: { idx: number }) {
  const field = useFieldContext();

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={(triggerProps) => (
          <Button
            className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            size="sm"
            type="button"
            variant="ghost"
            {...triggerProps}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Remove
          </Button>
        )}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Participant?</AlertDialogTitle>
          <AlertDialogDescription>
            Any information entered will be lost. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => field.removeValue(idx)}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
