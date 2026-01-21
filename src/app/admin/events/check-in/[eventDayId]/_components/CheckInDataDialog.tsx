"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import useAttendanceStore from "../_hooks/useAttendanceStore";

export default function CheckInDataDialog() {
  const setCheckInDialogOpen = useAttendanceStore(
    (state) => state.setCheckInDialogOpen,
  );
  const scannedData = useAttendanceStore((state) => state.scannedData);

  if (!scannedData) return null;

  return (
    <Dialog onOpenChange={setCheckInDialogOpen} open={scannedData !== null}>
      <DialogContent showCloseButton={false}>
        <div className="overflow-auto p-2">
          <DialogTitle>{scannedData.identifier}</DialogTitle>
          <pre>{JSON.stringify(scannedData, null, 2)}</pre>
          <DialogFooter>
            <Button
              onClick={() => setCheckInDialogOpen(false)}
              variant={"outline"}
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
