import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface TermsAndConditionsProps {
  triggerOverride?: React.ReactNode;
  customAcceptButton?: (closeTermsAndConditions: () => void) => React.ReactNode;
}

export default function TermsAndConditions({
  triggerOverride,
  customAcceptButton,
}: TermsAndConditionsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClose = () => setIsOpen(false);

  return (
    <Dialog onOpenChange={(isOpen) => setIsOpen(isOpen)} open={isOpen}>
      <DialogTrigger asChild={triggerOverride !== undefined}>
        {triggerOverride || <>Terms and Conditions</>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read the terms and conditions carefully before proceeding.
          </DialogDescription>
        </DialogHeader>
        <div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod
            velit euismod, euismod velit euismod, euismod velit euismod.
          </p>
        </div>
        <DialogFooter className="space-x-3">
          <DialogClose asChild>
            <Button type="button" variant={"outline"}>
              Close
            </Button>
          </DialogClose>
          {customAcceptButton?.(handleClose)}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
