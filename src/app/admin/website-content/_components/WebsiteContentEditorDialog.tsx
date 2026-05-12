"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WebsiteContentSection } from "./websiteContentSections";

export type WebsiteContentEditingFooter = {
  label: string;
  onClick: () => void;
};

type WebsiteContentEditorDialogProps = {
  children: ReactNode;
  editingFooter?: WebsiteContentEditingFooter;
  isLoadingSection: boolean;
  isSectionActionDisabled: boolean;
  isSaveDisabled: boolean;
  isSavingSection: boolean;
  isUploadingImages: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void | Promise<void>;
  selectedCard: Pick<WebsiteContentSection, "title" | "description"> | null;
};

function WebsiteContentEditorLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <div className="flex items-center justify-center rounded-lg border p-4">
          <Skeleton className="h-[220px] w-[180px] rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function WebsiteContentEditorDialog({
  children,
  editingFooter,
  isLoadingSection,
  isSectionActionDisabled,
  isSaveDisabled,
  isSavingSection,
  isUploadingImages,
  onOpenChange,
  onSave,
  open,
  selectedCard,
}: WebsiteContentEditorDialogProps) {
  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px]" />
        <DialogPrimitive.Viewport className="fixed inset-0 z-50 overflow-hidden p-3 sm:p-6">
          <div className="flex h-full items-center justify-center">
            <DialogPrimitive.Popup className="relative flex max-h-[calc(100vh-6rem)] w-[min(97vw,1550px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
              {editingFooter ? null : (
                <DialogPrimitive.Close
                  className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  render={<button type="button" />}
                >
                  <XIcon className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}

              <div className="space-y-1.5 border-border border-b px-6 py-5 pr-12 sm:px-7">
                <DialogPrimitive.Title className="font-bold text-4xl text-foreground">
                  {selectedCard?.title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-base text-muted-foreground">
                  {selectedCard?.description}
                </DialogPrimitive.Description>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-7">
                <div className="space-y-4">
                  {isLoadingSection ? (
                    <WebsiteContentEditorLoadingSkeleton />
                  ) : (
                    children
                  )}
                </div>
              </div>

              <div className="border-border border-t bg-background px-6 py-4 sm:px-7">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {editingFooter ? (
                    <Button
                      disabled={isSectionActionDisabled}
                      onClick={() => {
                        editingFooter.onClick();
                      }}
                      type="button"
                    >
                      {editingFooter.label}
                    </Button>
                  ) : (
                    <Button
                      disabled={isSaveDisabled}
                      onClick={onSave}
                      type="button"
                    >
                      {isUploadingImages
                        ? "Uploading images..."
                        : isSavingSection
                          ? "Saving..."
                          : "Save Changes"}
                    </Button>
                  )}
                </div>
              </div>
            </DialogPrimitive.Popup>
          </div>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
