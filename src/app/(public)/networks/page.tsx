import { cookies } from "next/headers";
import { NetworksPublicGrid } from "@/app/(public)/networks/_components/NetworksPublicGrid";
import tryCatch from "@/lib/server/tryCatch";
import { getNetworks } from "@/server/networks/queries/getNetworks";

export default async function Page() {
  const cookieStore = await cookies();
  const { data, error } = await tryCatch(
    getNetworks(cookieStore.getAll(), { scope: "public" }),
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15),transparent_60%),linear-gradient(to_bottom,hsl(var(--background)),hsl(var(--muted)/0.2))]">
      <section className="mx-auto w-full max-w-7xl px-4 pt-14 pb-8 sm:px-6 lg:px-8">
        <p className="font-medium text-primary text-sm uppercase tracking-[0.25em]">
          IBC Directory
        </p>
        <h1 className="mt-3 max-w-3xl font-semibold text-3xl text-foreground leading-tight sm:text-5xl">
          Networks
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Explore partner organizations and the leaders representing each
          network.
        </p>
      </section>

      {error || !data ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-destructive">
            Failed to load networks right now. Please check back later.
          </div>
        </section>
      ) : (
        <NetworksPublicGrid networks={data} />
      )}
    </main>
  );
}
