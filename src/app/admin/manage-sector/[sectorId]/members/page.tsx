import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/DataTable";
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
      <div>
        <Link
          className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
          href="/admin/manage-sector"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Sectors
        </Link>
        <div className="mt-4">
          <h1 className="font-bold text-3xl text-foreground">{sectorName}</h1>
          <p className="mt-2 text-muted-foreground">
            Viewing members under this sector
          </p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          No members assigned to this sector.
        </div>
      ) : (
        <DataTable columns={columns} data={members} />
      )}
    </div>
  );
}
