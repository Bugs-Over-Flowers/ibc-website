import { Building2, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { resolveNetworkLogoUrl } from "@/lib/storage/networkLogo";
import type { Network } from "@/server/networks/types";

interface NetworksTableProps {
  networks: Network[];
  onEdit: (network: Network) => void;
  onDelete: (network: Network) => void;
}

export function NetworksTable({
  networks,
  onEdit,
  onDelete,
}: NetworksTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Location/Type</TableHead>
            <TableHead>Representative</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {networks.length === 0 ? (
            <TableRow>
              <TableCell
                className="py-10 text-center text-muted-foreground"
                colSpan={5}
              >
                No networks found.
              </TableCell>
            </TableRow>
          ) : (
            networks.map((network) => {
              const logoUrl = resolveNetworkLogoUrl(network.logoUrl);

              return (
                <TableRow key={network.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted/30">
                      {logoUrl ? (
                        <Image
                          alt={`${network.organization} logo`}
                          className="object-cover"
                          fill
                          sizes="48px"
                          src={logoUrl}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <p className="truncate font-medium">
                      {network.organization}
                    </p>
                    <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                      {network.about}
                    </p>
                  </TableCell>
                  <TableCell>{network.locationType}</TableCell>
                  <TableCell>
                    <p className="font-medium">{network.representativeName}</p>
                    <p className="text-muted-foreground text-xs">
                      {network.representativePosition}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        onClick={() => onEdit(network)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onDelete(network)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
