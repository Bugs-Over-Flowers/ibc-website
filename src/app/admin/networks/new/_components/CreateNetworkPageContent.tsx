"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  EMPTY_FORM,
  isFormValid,
  normalizeFormState,
} from "@/app/admin/networks/_components/networkForm";
import { resolveNetworkLogoUrl } from "@/lib/storage/networkLogo";
import { createNetwork } from "@/server/networks/mutations/createNetwork";
import { uploadNetworkLogo } from "@/server/networks/mutations/uploadNetworkLogo";
import CreateNetworkMainSections from "./CreateNetworkMainSections";
import CreateNetworkSidebar from "./CreateNetworkSidebar";
import CreateNetworkTopBar from "./CreateNetworkTopBar";

export function CreateNetworkPageContent() {
  const router = useRouter();
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const logoPreviewObjectUrlRef = useRef<string | null>(null);

  const clearLogoPreviewObjectUrl = useCallback(() => {
    if (logoPreviewObjectUrlRef.current) {
      URL.revokeObjectURL(logoPreviewObjectUrlRef.current);
      logoPreviewObjectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearLogoPreviewObjectUrl();
    };
  }, [clearLogoPreviewObjectUrl]);

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

    clearLogoPreviewObjectUrl();
    const localPreview = URL.createObjectURL(file);
    logoPreviewObjectUrlRef.current = localPreview;
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
      clearLogoPreviewObjectUrl();
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
  const canCreate = isFormValid(normalizedForm);

  return (
    <div className="min-h-screen">
      <CreateNetworkTopBar />

      <div className="mx-auto max-w-7xl py-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void handleSave();
          }}
        >
          <div className="grid grid-cols-1 items-start gap-8 px-2 xl:grid-cols-[1fr_320px]">
            <CreateNetworkMainSections
              currentLogo={currentLogo}
              formState={formState}
              invalidFields={invalidFields}
              isUploading={isUploading}
              onFieldChange={handleFieldChange}
              onLogoUpload={handleLogoUpload}
              onRemoveLogo={() => {
                setFormState((prev) => ({ ...prev, logoUrl: null }));
                clearLogoPreviewObjectUrl();
                setLogoPreview(null);
                setPendingLogoFile(null);
              }}
            />

            <CreateNetworkSidebar
              currentLogo={currentLogo}
              formState={formState}
              isSaving={isSaving}
              isUploading={isUploading}
              isValid={canCreate}
              onCancel={() => {
                router.push("/admin/networks" as Route);
              }}
              onCreate={() => {
                void handleSave();
              }}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
