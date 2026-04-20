"use client";

import { Building2, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveNetworkLogoUrl } from "@/lib/storage/networkLogo";
import type { Network } from "@/server/networks/types";

type SortOption = "newest" | "oldest";

interface NetworksPublicGridProps {
  networks: Network[];
}

export function NetworksPublicGrid({ networks }: NetworksPublicGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filteredNetworks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = networks.filter((network) => {
      if (!q) {
        return true;
      }

      return network.organization.toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [networks, searchQuery, sortBy]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 pl-9"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search organization"
            value={searchQuery}
          />
        </div>

        <Select
          onValueChange={(value) => setSortBy(value as SortOption)}
          value={sortBy}
        >
          <SelectTrigger className="h-11 w-full sm:w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredNetworks.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/60 p-10 text-center">
          <p className="font-medium text-lg">No matching networks</p>
          <p className="mt-2 text-muted-foreground text-sm">
            Try a different organization keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNetworks.map((network) => {
            const logoUrl = resolveNetworkLogoUrl(network.logoUrl);

            return (
              <Card
                className="h-full border-border/70 bg-card/95 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                key={network.id}
              >
                <CardHeader className="space-y-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-muted/20">
                    {logoUrl ? (
                      <Image
                        alt={`${network.organization} logo`}
                        className="object-cover"
                        fill
                        sizes="64px"
                        src={logoUrl}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Building2 className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="line-clamp-2 text-xl">
                      {network.organization}
                    </CardTitle>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {network.locationType}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="line-clamp-4 text-muted-foreground text-sm leading-relaxed">
                    {network.about}
                  </p>

                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="font-medium text-sm">Representative</p>
                    <p className="mt-1 text-sm">{network.representativeName}</p>
                    <p className="text-muted-foreground text-xs">
                      {network.representativePosition}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
