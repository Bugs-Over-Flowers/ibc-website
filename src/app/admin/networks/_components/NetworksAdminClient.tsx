"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteNetwork } from "@/server/networks/mutations/deleteNetwork";
import type { Network } from "@/server/networks/types";
import { DeleteNetworkDialog } from "./DeleteNetworkDialog";
import { NetworksFilters } from "./NetworksFilters";
import { NetworksHeader } from "./NetworksHeader";
import { NetworksTable } from "./NetworksTable";
import type { SortOption } from "./networkForm";

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

  const handleEdit = (network: Network) => {
    router.push(`/admin/networks/${network.id}/edit` as Route);
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
        onEdit={handleEdit}
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
