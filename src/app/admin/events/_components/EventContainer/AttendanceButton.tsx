import { UserCheck2Icon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface AttendanceButtonProps {
  handleClick?: () => void;
}
export default function AttendanceButton({
  handleClick,
}: AttendanceButtonProps) {
  return (
    <DropdownMenuItem className="cursor-pointer" onClick={handleClick}>
      <UserCheck2Icon className="mr-2 h-4 w-4" />
      Check Attendance
    </DropdownMenuItem>
  );
}
