"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TermsAndConditionsProps {
  triggerOverride?: React.ReactElement;
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
      <DialogTrigger
        render={triggerOverride || <Button>Terms and Conditions</Button>}
      />

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
          <DialogClose
            render={
              <Button type="button" variant={"outline"}>
                Close
              </Button>
            }
          />

          {customAcceptButton?.(handleClose)}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
