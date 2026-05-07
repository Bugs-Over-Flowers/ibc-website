"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateNetworkButton() {
  const router = useRouter();

  const handleCreateNetwork = () => {
    router.push("/admin/networks/new");
  };

  return (
    <button
      className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-4 font-medium text-primary-foreground text-sm shadow-sm transition-colors hover:bg-primary/90"
      onClick={handleCreateNetwork}
      type="button"
    >
      <Plus className="mr-2 h-4 w-4" />
      Create Network
    </button>
  );
}
