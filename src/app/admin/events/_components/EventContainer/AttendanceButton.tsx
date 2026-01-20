import { UserCheck2Icon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import useAttendanceModalStore from "../../_hooks/useAttendanceModalStore";

export default function AttendanceButton() {
  const { setIsOpen } = useAttendanceModalStore();
  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onSelect={() => setIsOpen(true)}
    >
      <UserCheck2Icon className="mr-2 h-4 w-4" />
      Check Attendance
    </DropdownMenuItem>
  );
}
