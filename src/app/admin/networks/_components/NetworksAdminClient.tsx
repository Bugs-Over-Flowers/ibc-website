"use client";

import {
  Building2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { resolveNetworkLogoUrl } from "@/lib/storage/networkLogo";
import { createNetwork } from "@/server/networks/mutations/createNetwork";
import { deleteNetwork } from "@/server/networks/mutations/deleteNetwork";
import { updateNetwork } from "@/server/networks/mutations/updateNetwork";
import { uploadNetworkLogo } from "@/server/networks/mutations/uploadNetworkLogo";
import type { Network } from "@/server/networks/types";

type NetworkFormState = {
  organization: string;
  about: string;
  locationType: string;
  representativeName: string;
  representativePosition: string;
  logoUrl: string | null;
};

type SortOption = "newest" | "oldest";

const EMPTY_FORM: NetworkFormState = {
  organization: "",
  about: "",
  locationType: "",
  representativeName: "",
  representativePosition: "",
  logoUrl: null,
};

function mapNetworkToFormState(network: Network): NetworkFormState {
  return {
    organization: network.organization,
    about: network.about,
    locationType: network.locationType,
    representativeName: network.representativeName,
    representativePosition: network.representativePosition,
    logoUrl: network.logoUrl,
  };
}

function normalizeFormState(formState: NetworkFormState): NetworkFormState {
  return {
    organization: formState.organization.trim(),
    about: formState.about.trim(),
    locationType: formState.locationType.trim(),
    representativeName: formState.representativeName.trim(),
    representativePosition: formState.representativePosition.trim(),
    logoUrl: formState.logoUrl?.trim() ? formState.logoUrl.trim() : null,
  };
}

function isFormValid(formState: NetworkFormState): boolean {
  return (
    formState.organization.length > 0 &&
    formState.about.length > 0 &&
    formState.locationType.length > 0 &&
    formState.representativeName.length > 0 &&
    formState.representativePosition.length > 0
  );
}

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);
  const [formState, setFormState] = useState<NetworkFormState>(EMPTY_FORM);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Network | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openCreateDialog = () => {
    setEditingNetwork(null);
    setFormState(EMPTY_FORM);
    setLogoPreview(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (network: Network) => {
    setEditingNetwork(network);
    setFormState(mapNetworkToFormState(network));
    setLogoPreview(resolveNetworkLogoUrl(network.logoUrl));
    setIsDialogOpen(true);
  };

  const closeDialog = (open: boolean) => {
    setIsDialogOpen(open);

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
    const normalized = normalizeFormState(formState);

    if (!isFormValid(normalized)) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingNetwork) {
        const updated = await updateNetwork(editingNetwork.id, normalized);

        setNetworks((prev) =>
          prev.map((network) =>
            network.id === updated.id ? updated : network,
          ),
        );
        toast.success("Network updated.");
      } else {
        const created = await createNetwork(normalized);
        setNetworks((prev) => [created, ...prev]);
        toast.success("Network created.");
      }

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-bold text-3xl text-foreground">Networks</h1>
          <p className="mt-2 text-muted-foreground">
            Manage network organizations, representatives, and logos.
          </p>
        </div>
        <Button onClick={openCreateDialog} type="button">
          <Plus className="mr-2 h-4 w-4" />
          Add Network
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by organization"
            value={searchQuery}
          />
        </div>

        <Select
          onValueChange={(value) => setSortBy(value as SortOption)}
          value={sortBy}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Location/Type</TableHead>
              <TableHead>Representative</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNetworks.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-10 text-center text-muted-foreground"
                  colSpan={5}
                >
                  No networks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredNetworks.map((network) => {
                const logoUrl = resolveNetworkLogoUrl(network.logoUrl);

                return (
                  <TableRow key={network.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted/30">
                        {logoUrl ? (
                          <Image
                            alt={`${network.organization} logo`}
                            className="object-cover"
                            fill
                            sizes="48px"
                            src={logoUrl}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="truncate font-medium">
                        {network.organization}
                      </p>
                      <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                        {network.about}
                      </p>
                    </TableCell>
                    <TableCell>{network.locationType}</TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {network.representativeName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {network.representativePosition}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          onClick={() => openEditDialog(network)}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setDeleteTarget(network)}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog onOpenChange={closeDialog} open={isDialogOpen}>
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
                  handleFieldChange("organization", event.target.value)
                }
                placeholder="Organization name"
                value={formState.organization}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                onChange={(event) =>
                  handleFieldChange("about", event.target.value)
                }
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
                  handleFieldChange("locationType", event.target.value)
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
                    handleFieldChange("representativeName", event.target.value)
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
                    handleFieldChange(
                      "representativePosition",
                      event.target.value,
                    )
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
                    void handleLogoUpload(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                  type="file"
                />
                {formState.logoUrl && (
                  <Button
                    onClick={() => {
                      setFormState((prev) => ({ ...prev, logoUrl: null }));
                      setLogoPreview(null);
                    }}
                    type="button"
                    variant="outline"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remove logo
                  </Button>
                )}
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
              onClick={() => closeDialog(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isSaving || isUploading}
              onClick={() => {
                void handleSave();
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

      <AlertDialog
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete network?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.organization}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={() => {
                void handleDelete();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
