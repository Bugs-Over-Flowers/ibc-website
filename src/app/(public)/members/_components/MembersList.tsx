"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import MembersFilter from "./MembersFilter";
import { MembersGrid } from "./MembersGrid";
export interface Member {
  id: number;
  businessName: string;
  sector: string;
  logoImageURL?: string;
  websiteURL?: string;
}

interface MembersListProps {
  members: Member[];
  sectors: string[];
}

export default function MembersList({ members, sectors }: MembersListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSector, setFilterSector] = useState("all");

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.sector.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector =
        !filterSector ||
        filterSector === "all" ||
        member.sector.trim().toLowerCase() ===
          filterSector.trim().toLowerCase();
      return matchesSearch && matchesSector;
    });
  }, [searchQuery, filterSector, members]);

  return (
    <section className="relative overflow-hidden py-0">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
        className="pointer-events-none absolute top-1/4 left-0 h-[400px] w-[400px] select-none rounded-full bg-primary/5 blur-[120px]"
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.12, 0.05] }}
        className="pointer-events-none absolute right-0 bottom-1/4 h-[500px] w-[500px] select-none rounded-full bg-accent/10 blur-[120px]"
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      {/* Main content */}
      <div className="relative z-10">
        <MembersFilter
          filteredCount={filteredMembers.length}
          filterSector={filterSector}
          searchQuery={searchQuery}
          sectors={sectors.map((sector) => ({ label: sector, value: sector }))}
          setFilterSector={setFilterSector}
          setSearchQuery={setSearchQuery}
        />
        <MembersGrid members={filteredMembers} />
      </div>
    </section>
  );
}
