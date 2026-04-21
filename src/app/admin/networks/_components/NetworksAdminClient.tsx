"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { resolveNetworkLogoUrl } from "@/lib/storage/networkLogo";
import { deleteNetwork } from "@/server/networks/mutations/deleteNetwork";
import { updateNetwork } from "@/server/networks/mutations/updateNetwork";
import { uploadNetworkLogo } from "@/server/networks/mutations/uploadNetworkLogo";
import type { Network } from "@/server/networks/types";
import { DeleteNetworkDialog } from "./DeleteNetworkDialog";
import { NetworkFormDialog } from "./NetworkFormDialog";
import { NetworksFilters } from "./NetworksFilters";
import { NetworksHeader } from "./NetworksHeader";
import { NetworksTable } from "./NetworksTable";
import {
  EMPTY_FORM,
  isFormValid,
  mapNetworkToFormState,
  type NetworkFormState,
  normalizeFormState,
  type SortOption,
} from "./networkForm";

interface NetworksAdminClientProps {
  initialNetworks: Network[];
}

export function NetworksAdminClient({
  initialNetworks,
}: NetworksAdminClientProps) {
  const router = useRouter();
  const [networks, setNetworks] = useState<Network[]>(initialNetworks);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [formState, setFormState] = useState<NetworkFormState>(EMPTY_FORM);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Network | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setNetworks(initialNetworks);
  }, [initialNetworks]);

  const filteredNetworks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = networks.filter((network) => {
      if (!q) {
        return true;
      }

      return network.organization.toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [networks, searchQuery, sortBy]);

  const openEditDialog = (network: Network) => {
    setEditingNetwork(network);
    setFormState(mapNetworkToFormState(network));
    setLogoPreview(resolveNetworkLogoUrl(network.logoUrl));
  };

  const closeDialog = (open: boolean) => {
    if (!open) {
      setEditingNetwork(null);
      setFormState(EMPTY_FORM);
      setLogoPreview(null);
      setIsSaving(false);
      setIsUploading(false);
    }
  };

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

    setIsUploading(true);

    try {
      const localPreview = URL.createObjectURL(file);
      setLogoPreview(localPreview);

      const formData = new FormData();
      formData.append("file", file);
      const uploadedUrl = await uploadNetworkLogo(formData);
      setFormState((prev) => ({ ...prev, logoUrl: uploadedUrl }));
      setLogoPreview(uploadedUrl);
      toast.success("Logo uploaded successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload logo.";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editingNetwork) {
      return;
    }

    const normalized = normalizeFormState(formState);

    if (!isFormValid(normalized)) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateNetwork(editingNetwork.id, normalized);

      setNetworks((prev) =>
        prev.map((network) => (network.id === updated.id ? updated : network)),
      );
      toast.success("Network updated.");

      closeDialog(false);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save network.";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const snapshot = networks;
    setIsDeleting(true);
    setNetworks((prev) =>
      prev.filter((network) => network.id !== deleteTarget.id),
    );

    try {
      await deleteNetwork(deleteTarget.id);
      toast.success("Network deleted.");
      router.refresh();
    } catch (error) {
      setNetworks(snapshot);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete network.";
      toast.error(errorMessage);
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  const currentLogo = logoPreview ?? resolveNetworkLogoUrl(formState.logoUrl);

  return (
    <div className="space-y-6 px-2">
      <NetworksHeader />

      <NetworksFilters
        onSearchQueryChange={setSearchQuery}
        onSortByChange={setSortBy}
        searchQuery={searchQuery}
        sortBy={sortBy}
      />

      <NetworksTable
        networks={filteredNetworks}
        onDelete={setDeleteTarget}
        onEdit={openEditDialog}
      />

      <NetworkFormDialog
        currentLogo={currentLogo}
        editingNetwork={editingNetwork}
        formState={formState}
        isSaving={isSaving}
        isUploading={isUploading}
        onFieldChange={handleFieldChange}
        onLogoUpload={handleLogoUpload}
        onOpenChange={closeDialog}
        onRemoveLogo={() => {
          setFormState((prev) => ({ ...prev, logoUrl: null }));
          setLogoPreview(null);
        }}
        onSave={handleSave}
        open={Boolean(editingNetwork)}
      />

      <DeleteNetworkDialog
        isDeleting={isDeleting}
        onConfirmDelete={handleDelete}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        open={Boolean(deleteTarget)}
        target={deleteTarget}
      />
    </div>
  );
}
