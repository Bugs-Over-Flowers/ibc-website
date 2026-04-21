import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { getNetworks } from "@/server/networks/queries/getNetworks";
import { NetworksList } from "./NetworksList";

export default async function NetworksListSection() {
  const cookieStore = (await cookies()).getAll();
  const { data, error } = await tryCatch(
    getNetworks(cookieStore, { scope: "public" }),
  );

  if (error || !data) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-destructive">
          Failed to load networks right now. Please check back later.
        </div>
      </section>
    );
  }

  return <NetworksList networks={data} />;
}
