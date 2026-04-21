import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NetworksHeaderProps {
  onAddNetwork: () => void;
}

export function NetworksHeader({ onAddNetwork }: NetworksHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-bold text-3xl text-foreground">Networks</h1>
        <p className="mt-2 text-muted-foreground">
          Manage network organizations, representatives, and logos.
        </p>
      </div>
      <Button onClick={onAddNetwork} type="button">
        <Plus className="mr-2 h-4 w-4" />
        Add Network
      </Button>
    </div>
  );
}
