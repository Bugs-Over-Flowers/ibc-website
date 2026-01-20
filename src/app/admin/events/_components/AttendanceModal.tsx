import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useAttendanceModalStore from "../_hooks/useAttendanceModalStore";

export default function AttendanceModal() {
  const { eventId, isOpen, setIsOpen } = useAttendanceModalStore();
  return (
    <Dialog
      onOpenChange={(open) => {
        console.log("DISPLAYING ASJIDAKSCNASNAD");
        setIsOpen(open);
      }}
      open={isOpen}
    >
      <DialogContent>
        <DialogTitle>Lalala</DialogTitle>
      </DialogContent>
    </Dialog>
  );
}
