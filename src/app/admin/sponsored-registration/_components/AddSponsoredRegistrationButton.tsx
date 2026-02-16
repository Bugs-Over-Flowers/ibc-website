import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AddSponsoredRegistrationButton() {
  return (
    <Button className="h-12 rounded-xl" size="sm">
      <Link href="/admin/sponsored-registration/new">
        <Plus className="mr-2 h-4 w-4" />
        Add Sponsored Registration
      </Link>
    </Button>
  );
}
