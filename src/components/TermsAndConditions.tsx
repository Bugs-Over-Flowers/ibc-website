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

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registration Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read these terms before proceeding with your registration.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-2 text-muted-foreground text-sm leading-relaxed">
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              <span className="font-medium text-foreground">
                Registration Information.
              </span>{" "}
              You confirm that all details you submit are accurate and complete.
              Incomplete or incorrect information may affect your registration
              status.
            </li>
            <li>
              <span className="font-medium text-foreground">Data Privacy.</span>{" "}
              Personal information collected during registration is used for
              event processing, participant coordination, and official event
              records. Data is handled by authorized personnel and protected
              using reasonable administrative and technical safeguards.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Communication Consent.
              </span>{" "}
              By registering, you agree to receive event-related updates,
              confirmations, reminders, and important announcements through
              email, phone, or other provided contact channels.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Photography and Media Consent.
              </span>{" "}
              Event activities may be photographed or recorded. By attending,
              you consent to the use of your image, voice, or likeness in IBC
              documentation, website content, social media, and promotional
              materials. If you prefer not to be featured, please inform event
              staff before or during the event.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Event Changes.
              </span>{" "}
              Iloilo Business Club may update event schedules, speakers,
              sessions, or venue details when necessary. Participants will be
              notified through official communication channels.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Code of Conduct.
              </span>{" "}
              Participants are expected to act professionally and respectfully.
              Disruptive, unsafe, or inappropriate behavior may result in
              removal from the event.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Acknowledgment.
              </span>{" "}
              By continuing with registration, you acknowledge that you have
              read, understood, and agreed to these terms and conditions.
            </li>
          </ol>
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
