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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => execute(undefined)}
          disabled={isPending}
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
