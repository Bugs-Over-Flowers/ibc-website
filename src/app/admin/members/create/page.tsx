import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllSectors } from "@/server/members/queries/getAllSectors";
import { CreateManualMemberFormWrapper } from "./_components/forms/CreateManualMemberFormWrapper";

export default async function CreateMemberPage() {
  const cookieStore = await cookies();
  const sectors = await getAllSectors(cookieStore.getAll());

  return (
    <div className="pb-8">
      <div className="bg-primary px-4 pt-8 pb-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link href="/admin/members">
              <Button className="text-primary-foreground" variant="secondary">
                <ChevronLeft className="h-4 w-4" />
                Back to Members
              </Button>
            </Link>
          </div>

          <h1 className="mb-4 font-extrabold text-4xl text-primary-foreground tracking-tight md:text-5xl">
            Create Member
          </h1>
          <p className="max-w-2xl font-medium text-lg text-primary-foreground/90 leading-relaxed">
            Add a member manually with the same guided multi-step workflow used
            across membership and sponsored registration creation.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <CreateManualMemberFormWrapper sectors={sectors} />
      </div>
    </div>
  );
}
