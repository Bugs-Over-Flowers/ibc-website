export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome to the admin dashboard
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-semibold text-gray-900">
            Dashboard Content
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Your dashboard content will appear here. Add charts, statistics, or
            quick actions to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
