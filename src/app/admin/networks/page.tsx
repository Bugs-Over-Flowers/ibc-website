import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NetworksAdminClient } from "@/app/admin/networks/_components/NetworksAdminClient";
import tryCatch from "@/lib/server/tryCatch";
import { getNetworks } from "@/server/networks/queries/getNetworks";

export const metadata: Metadata = {
  title: "Networks | Admin",
  description: "Manage IBC network organizations and representatives",
};

export default async function AdminNetworksPage() {
  const cookieStore = await cookies();
  const { data, error } = await tryCatch(
    getNetworks(cookieStore.getAll(), { scope: "admin" }),
  );

  if (error || !data) {
    return (
      <div className="space-y-4 px-2">
        <h1 className="font-bold text-3xl text-foreground">Networks</h1>
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          Failed to load networks. Please try again.
        </div>
      </div>
    );
  }

  return <NetworksAdminClient initialNetworks={data} />;
}
