"use client";

import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { NetworkFormFields } from "@/app/admin/networks/_components/NetworkFormFields";
import {
  EMPTY_FORM,
  isFormValid,
  normalizeFormState,
} from "@/app/admin/networks/_components/networkForm";
import { Button } from "@/components/ui/button";
import { resolveNetworkLogoUrl } from "@/lib/storage/networkLogo";
import { createNetwork } from "@/server/networks/mutations/createNetwork";
import { uploadNetworkLogo } from "@/server/networks/mutations/uploadNetworkLogo";

export function CreateNetworkPageContent() {
  const router = useRouter();
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFieldChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);
    setPendingLogoFile(file);
  };

  const handleSave = async () => {
    setSubmitAttempted(true);
    let normalized = normalizeFormState(formState);

    if (!isFormValid(normalized)) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSaving(true);

    try {
      if (pendingLogoFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", pendingLogoFile);
        const uploadedUrl = await uploadNetworkLogo(formData);
        normalized = { ...normalized, logoUrl: uploadedUrl };
      }

      await createNetwork(normalized);
      toast.success("Network created.");
      setFormState(EMPTY_FORM);
      setLogoPreview(null);
      setPendingLogoFile(null);
      setSubmitAttempted(false);
      router.replace("/admin/networks" as Route);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save network.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setIsSaving(false);
    }
  };

  const currentLogo = logoPreview ?? resolveNetworkLogoUrl(formState.logoUrl);
  const normalizedForm = normalizeFormState(formState);
  const invalidFields = {
    organization: submitAttempted && normalizedForm.organization.length === 0,
    about: submitAttempted && normalizedForm.about.length === 0,
    locationType: submitAttempted && normalizedForm.locationType.length === 0,
    representativeName:
      submitAttempted && normalizedForm.representativeName.length === 0,
    representativePosition:
      submitAttempted && normalizedForm.representativePosition.length === 0,
  };

  return (
    <div className="space-y-6 px-2 pb-8">
      <div>
        <Link className="inline-flex" href="/admin/networks">
          <Button size="sm" type="button" variant="secondary">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Networks
          </Button>
        </Link>
        <div className="mt-6">
          <h1 className="font-bold text-3xl text-foreground">Add Network</h1>
          <p className="mt-2 text-muted-foreground">
            Add network details and optionally upload a logo to Supabase
            Storage.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <NetworkFormFields
          currentLogo={currentLogo}
          formState={formState}
          invalidFields={invalidFields}
          isUploading={isUploading}
          onFieldChange={handleFieldChange}
          onLogoUpload={handleLogoUpload}
          onRemoveLogo={() => {
            setFormState((prev) => ({ ...prev, logoUrl: null }));
            setLogoPreview(null);
            setPendingLogoFile(null);
          }}
        />

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t pt-4">
          <Link href="/admin/networks">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            disabled={isSaving || isUploading}
            onClick={() => {
              void handleSave();
            }}
            type="button"
          >
            {isSaving ? "Saving..." : "Create Network"}
          </Button>
        </div>
      </div>
    </div>
  );
}
