import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFieldContext } from "@/hooks/_formHooks";

export function RemoveParticipantButton({ idx }: { idx: number }) {
  const field = useFieldContext();

  return (
    <Button
      className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() => field.removeValue(idx)}
      size="sm"
      type="button"
      variant="ghost"
    >
      <Trash2 className="mr-1 h-4 w-4" />
      Remove
    </Button>
  );
}
