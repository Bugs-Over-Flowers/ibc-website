"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CreateSectorButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("/admin/create-sector")}>
      <Plus className="mr-2 h-4 w-4" />
      Create Sector
    </Button>
  );
}
