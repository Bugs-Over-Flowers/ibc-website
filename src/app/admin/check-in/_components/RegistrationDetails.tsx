import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { RegistrationIdentifier } from "@/lib/validation/qr/standard";

interface RegistrationDetailsProps {
  eventTitle: string;
  registrationIdentifier: RegistrationIdentifier;
  day: string;
}

export default function RegistrationDetails({
  eventTitle,
  registrationIdentifier,
  day,
}: RegistrationDetailsProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button>View Details</Button>}></DialogTrigger>
      <DialogContent>
        <DialogTitle>Details</DialogTitle>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Event Title</TableCell>
              <TableCell>{eventTitle}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Registration Identifier</TableCell>
              <TableCell>{registrationIdentifier}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Day</TableCell>
              <TableCell>{day}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
