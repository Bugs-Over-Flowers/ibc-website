import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Network } from "@/server/networks/types";
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

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              onChange={(event) =>
                onFieldChange("organization", event.target.value)
              }
              placeholder="Organization name"
              value={formState.organization}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              onChange={(event) => onFieldChange("about", event.target.value)}
              placeholder="Short description"
              rows={4}
              value={formState.about}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location-type">Location/Type</Label>
            <Input
              id="location-type"
              onChange={(event) =>
                onFieldChange("locationType", event.target.value)
              }
              placeholder="Regional Governor, Private Sector Head, etc."
              value={formState.locationType}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="representative-name">Representative Name</Label>
              <Input
                id="representative-name"
                onChange={(event) =>
                  onFieldChange("representativeName", event.target.value)
                }
                placeholder="Representative name"
                value={formState.representativeName}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="representative-position">
                Representative Position
              </Label>
              <Input
                id="representative-position"
                onChange={(event) =>
                  onFieldChange("representativePosition", event.target.value)
                }
                placeholder="Representative position"
                value={formState.representativePosition}
              />
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border bg-muted/20 p-3">
            <Label htmlFor="network-logo">Logo Upload</Label>
            <div className="flex flex-wrap items-center gap-3">
              <label
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                htmlFor="network-logo"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Logo"}
              </label>
              <input
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="sr-only"
                id="network-logo"
                onChange={(event) => {
                  void onLogoUpload(event.target.files?.[0]);
                  event.target.value = "";
                }}
                type="file"
              />
              {formState.logoUrl ? (
                <Button onClick={onRemoveLogo} type="button" variant="outline">
                  <X className="mr-1 h-4 w-4" />
                  Remove logo
                </Button>
              ) : null}
            </div>
            <p className="text-muted-foreground text-xs">
              Accepted formats: PNG, JPG, WEBP, SVG. Maximum file size: 5MB.
            </p>

            <div className="relative h-28 w-28 overflow-hidden rounded-lg border bg-background">
              {currentLogo ? (
                <Image
                  alt="Network logo preview"
                  className="object-cover"
                  fill
                  sizes="112px"
                  src={currentLogo}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                  No logo
                </div>
              )}
            </div>
          </div>
        </div>

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
