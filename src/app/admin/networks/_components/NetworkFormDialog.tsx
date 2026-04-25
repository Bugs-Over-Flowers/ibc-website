import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Network } from "@/server/networks/types";
import { NetworkFormFields } from "./NetworkFormFields";
import type { NetworkFormState } from "./networkForm";

interface NetworkFormDialogProps {
  open: boolean;
  editingNetwork: Network | null;
  formState: NetworkFormState;
  isSaving: boolean;
  isUploading: boolean;
  currentLogo: string | null;
  onOpenChange: (open: boolean) => void;
  onFieldChange: (field: keyof NetworkFormState, value: string) => void;
  onLogoUpload: (file: File | undefined) => void;
  onRemoveLogo: () => void;
  onSave: () => void;
}

export function NetworkFormDialog({
  open,
  editingNetwork,
  formState,
  isSaving,
  isUploading,
  currentLogo,
  onOpenChange,
  onFieldChange,
  onLogoUpload,
  onRemoveLogo,
  onSave,
}: NetworkFormDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingNetwork ? "Edit Network" : "Add Network"}
          </DialogTitle>
          <DialogDescription>
            Add network details and optionally upload a logo to Supabase
            Storage.
          </DialogDescription>
        </DialogHeader>

        <NetworkFormFields
          currentLogo={currentLogo}
          formState={formState}
          isUploading={isUploading}
          onFieldChange={onFieldChange}
          onLogoUpload={onLogoUpload}
          onRemoveLogo={onRemoveLogo}
        />

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isSaving || isUploading}
            onClick={() => {
              void onSave();
            }}
            type="button"
          >
            {isSaving
              ? "Saving..."
              : editingNetwork
                ? "Save Changes"
                : "Create Network"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
