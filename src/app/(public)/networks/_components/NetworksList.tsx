"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Network } from "@/server/networks/types";
import { NetworksFilter } from "./NetworksFilter";
import { NetworksGrid } from "./NetworksGrid";

type SortOption = "newest" | "oldest";

interface NetworksListProps {
  networks: Network[];
}

export function NetworksList({ networks }: NetworksListProps) {
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

    return filtered.toSorted((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [networks, searchQuery, sortBy]);

  return (
    <section className="relative overflow-hidden py-0">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.09, 0.04] }}
        className="pointer-events-none absolute top-1/4 left-0 h-[420px] w-[420px] select-none rounded-full bg-primary/5 blur-[120px]"
        transition={{
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.1, 0.04] }}
        className="pointer-events-none absolute right-0 bottom-1/4 h-[520px] w-[520px] select-none rounded-full bg-accent/10 blur-[120px]"
        transition={{
          duration: 11,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="relative z-10">
        <NetworksFilter
          filteredCount={filteredNetworks.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSortBy={setSortBy}
          sortBy={sortBy}
        />
        <NetworksGrid networks={filteredNetworks} />
      </div>
    </section>
  );
}
