import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { buttonVariants } from "@/lib/ui-variants";
import { getMembersBySector } from "@/server/members/queries/getMembersBySector";
import { columns } from "./_components/columns";

export default async function SectorMembersPage({
  params,
}: {
  params: Promise<{ sectorId: string }>;
}) {
  const { sectorId } = await params;
  const id = Number.parseInt(sectorId, 10);

  if (Number.isNaN(id)) {
    notFound();
  }

  const cookieStore = await cookies();
  const { sectorName, members } = await getMembersBySector(
    cookieStore.getAll(),
    id,
  );

  return (
    <div className="space-y-6 px-2">
      <div className="flex items-center gap-4">
        <Link
          className={buttonVariants({ variant: "outline", size: "icon" })}
          href="/admin/manage-sector"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-bold text-2xl text-foreground md:text-3xl">
            {sectorName}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Viewing members under this sector
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-background p-4 md:p-6">
        {members.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No members assigned to this sector.
          </div>
        ) : (
          <DataTable columns={columns} data={members} />
        )}
      </div>
    </div>
  );
}
