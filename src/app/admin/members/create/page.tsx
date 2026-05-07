import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import BackButton from "@/app/admin/_components/BackButton";
import { getAllSectors } from "@/server/members/queries/getAllSectors";
import { CreateManualMemberFormWrapper } from "./_components/forms/CreateManualMemberFormWrapper";
import CreateMemberLoading from "./loading";

export const metadata: Metadata = {
  title: "Create Member | Admin",
  description: "Manually add a new member to the directory.",
};

export default async function CreateMemberPage() {
  const cookieStore = await cookies();
  const sectors = await getAllSectors(cookieStore.getAll());

  return (
    <div className="pb-8">
      <div className="px-4 pt-8 pb-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <BackButton href="/admin/members" label="Back to Members" />
          </div>

          <h1 className="mb-4 font-extrabold text-4xl text-foreground tracking-tight md:text-5xl">
            Create Member
          </h1>
          <p className="max-w-2xl font-medium text-foreground/90 text-lg leading-relaxed">
            Add a member manually with the same guided multi-step workflow used
            across membership and sponsored registration creation.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<CreateMemberLoading />}>
          <CreateManualMemberFormWrapper sectors={sectors} />
        </Suspense>
      </div>
    </div>
  );
}
