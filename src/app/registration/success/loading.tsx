import { Skeleton } from "@/components/ui/skeleton";

const infoRowKeys = Array.from(
  { length: 4 },
  (_, index) => `info-row-${index}`,
);

export default function RegistrationSuccessLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-7">
        <Skeleton className="mb-3 h-36 w-full rounded-xl" />

        <div className="flex items-start gap-4">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="w-full space-y-2">
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-5 w-80 max-w-full" />
          </div>
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

        <div className="space-y-3 rounded-2xl bg-linear-to-br from-primary/10 via-primary/[0.07] to-transparent p-6 ring-1 ring-primary/25 sm:p-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-56" />
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/60 p-6 sm:p-8">
          <Skeleton className="mb-4 h-6 w-52" />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {infoRowKeys.map((key) => (
              <li className="flex items-start gap-4 rounded-xl" key={key}>
                <Skeleton className="h-8 w-8 rounded-xl" />
                <div className="mt-1 w-full space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-4 w-full max-w-xs" />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/60 p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-[206px] w-[206px] rounded-2xl" />
            <Skeleton className="h-3 w-72 max-w-full" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Skeleton className="h-10 w-full sm:flex-1" />
          <Skeleton className="h-10 w-full sm:flex-1" />
        </div>
      </section>
    </main>
  );
}
