"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useAction";
import { logout } from "@/server/auth/mutations/logout";

export default function Page() {
  const router = useRouter();
  const { execute, isPending } = useAction(logout, {
    onSuccess: () => {
      router.push("/auth");
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-bold text-2xl">Dashboard</h1>
        <Button
          disabled={isPending}
          onClick={() => execute(undefined)}
          variant="outline"
        >
          {isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
      <div className="grid gap-4">
        <p>Welcome to the admin dashboard.</p>
      </div>
    </div>
  );
}
