import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import tryCatch from "@/lib/server/tryCatch";
import { getNetworks } from "@/server/networks/queries/getNetworks";
import EditNetworkPageContent from "./_components/EditNetworkPageContent";

export const metadata: Metadata = {
  title: "Edit Network | Admin",
  description: "Update an existing network organization and representative",
};

type EditNetworkPageProps = {
  params: Promise<{ networkId: string }>;
};

export default async function EditNetworkPage({
  params,
}: EditNetworkPageProps) {
  const { networkId } = await params;
  const cookieStore = await cookies();

  const { data, error } = await tryCatch(
    getNetworks(cookieStore.getAll(), { scope: "admin" }),
  );

  if (error || !data) {
    return (
      <div className="space-y-4 px-2">
        <h1 className="font-bold text-3xl text-foreground">Edit Network</h1>
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          Failed to load network details. Please try again.
        </div>
      </div>
    );
  }

  const network = data.find((item) => item.id === networkId);

  if (!network) {
    notFound();
  }

  return <EditNetworkPageContent network={network} />;
}
