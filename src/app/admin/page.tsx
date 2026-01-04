export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl text-foreground">Dashboard</h1>
        <div className="text-muted-foreground text-sm">
          Welcome to the admin dashboard
        </div>
      </div>

      <div className="rounded-lg border border-border border-dashed p-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="font-semibold text-foreground text-lg">
            Dashboard Content
          </h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Your dashboard content will appear here. Add charts, statistics, or
            quick actions to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
