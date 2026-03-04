// Stable ID lists for skeleton keys
const FIVE_IDS = ["a", "b", "c", "d", "e"];
const SEVEN_IDS = ["a", "b", "c", "d", "e", "f", "g"];
const THREE_IDS = ["a", "b", "c"];

export default function SponsoredRegistrationDetailLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Back Button */}
      <div className="h-5 w-40 rounded bg-muted" />

      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-4 w-80 rounded bg-muted" />
          </div>
          <div className="h-8 w-32 rounded bg-muted" />
        </div>
      </div>

      {/* Sponsored Link Card */}
      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="h-10 flex-1 rounded-lg bg-muted" />
          <div className="flex gap-1.5">
            <div className="h-9 w-9 rounded border bg-muted" />
            <div className="h-9 w-9 rounded border bg-muted" />
          </div>
        </div>
      </div>

      {/* Slot Utilization Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-5">
          {FIVE_IDS.map((id) => (
            <div className="space-y-2" key={`utilization-${id}`}>
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-6 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          <div className="h-3 w-full rounded-full bg-muted" />
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-1">
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-3 w-64 rounded bg-muted" />
          </div>
          <div className="ms-auto flex items-center gap-2">
            <div className="h-10 w-32 rounded border bg-muted" />
            <div className="h-10 w-10 rounded bg-muted" />
          </div>
        </div>
      </div>

      {/* Registered Guests Section */}
      <div className="space-y-4">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {SEVEN_IDS.map((id) => (
                  <th className="px-4 py-3" key={`header-${id}`}>
                    <div className="h-4 w-16 rounded bg-muted" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {THREE_IDS.map((rowId) => (
                <tr className="border-b" key={`row-${rowId}`}>
                  {SEVEN_IDS.map((colId) => (
                    <td className="px-4 py-3" key={`cell-${rowId}-${colId}`}>
                      <div className="h-4 w-20 rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
