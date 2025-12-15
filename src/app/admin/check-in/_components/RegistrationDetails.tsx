import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RegistrationIdentifier } from "@/lib/validation/qr/standard";

interface RegistrationDetailsProps {
  eventTitle: string;
  registrationIdentifier: RegistrationIdentifier;
}

export default function RegistrationDetails({
  eventTitle,
  registrationIdentifier,
}: RegistrationDetailsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View Details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Details</DialogTitle>
        <h1>{eventTitle}</h1>
        <pre>{registrationIdentifier}</pre>
      </DialogContent>
    </Dialog>
  );
}
