"use client";

import { PenSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EditMemberButtonProps {
  memberId: string;
}

export function EditMemberButton({ memberId }: EditMemberButtonProps) {
  return (
    <Link href={`/admin/members/${memberId}/edit`}>
      <Button className="gap-2" size="sm" variant="outline">
        <PenSquare className="h-4 w-4" />
        Edit Member
      </Button>
    </Link>
  );
}
