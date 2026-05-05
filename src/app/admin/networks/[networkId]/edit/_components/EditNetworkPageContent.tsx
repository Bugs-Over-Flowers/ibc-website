"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  isFormValid,
  mapNetworkToFormState,
  type NetworkFormState,
  normalizeFormState,
} from "@/app/admin/networks/_components/networkForm";
import CreateNetworkMainSections from "@/app/admin/networks/new/_components/CreateNetworkMainSections";
import CreateNetworkSidebar from "@/app/admin/networks/new/_components/CreateNetworkSidebar";
import CreateNetworkTopBar from "@/app/admin/networks/new/_components/CreateNetworkTopBar";
import { resolveNetworkLogoUrl } from "@/lib/storage/networkLogo";
import { updateNetwork } from "@/server/networks/mutations/updateNetwork";
import { uploadNetworkLogo } from "@/server/networks/mutations/uploadNetworkLogo";
import type { Network } from "@/server/networks/types";

type EditNetworkPageContentProps = {
  network: Network;
};

export default function EditNetworkPageContent({
  network,
}: EditNetworkPageContentProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<NetworkFormState>(
    mapNetworkToFormState(network),
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(
    resolveNetworkLogoUrl(network.logoUrl),
  );
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

  const handleFieldChange = (field: keyof NetworkFormState, value: string) => {
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

      await updateNetwork(network.id, normalized);
      toast.success("Network updated.");
      router.replace("/admin/networks" as Route);
      router.refresh();
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
  const canSave = isFormValid(normalizedForm);

  return (
    <div className="min-h-screen">
      <CreateNetworkTopBar crumbLabel="Edit Network" />

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
              description="Update organization details, representative information, and logo from one place."
              detailsDescription="Keep public-facing network data accurate and up to date."
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
              title="Edit Network"
            />

            <CreateNetworkSidebar
              currentLogo={currentLogo}
              formState={formState}
              isSaving={isSaving}
              isUploading={isUploading}
              isValid={canSave}
              onCancel={() => {
                router.push("/admin/networks" as Route);
              }}
              onCreate={() => {
                void handleSave();
              }}
              submitLabel="Save Changes"
              submittingLabel="Saving Changes..."
            />
          </div>
        </form>
      </div>
    </div>
  );
}
