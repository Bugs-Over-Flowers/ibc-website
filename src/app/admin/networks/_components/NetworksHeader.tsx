import CreateNetworkButton from "./CreateNetworkButton";

export function NetworksHeader() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-bold text-3xl text-foreground">Networks</h1>
        <p className="mt-2 text-muted-foreground">
          Manage network organizations, representatives, and logos.
        </p>
      </div>
      <CreateNetworkButton />
    </div>
  );
}
