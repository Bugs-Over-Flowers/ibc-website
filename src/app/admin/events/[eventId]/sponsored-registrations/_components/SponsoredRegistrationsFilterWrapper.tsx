"use client";

import { useState } from "react";
import type { Database } from "@/lib/supabase/db.types";
import { SponsoredRegistrationsFilter } from "./SponsoredRegistrationsFilter";
import { SponsoredRegistrationsList } from "./SponsoredRegistrationsList";

type Event = Database["public"]["Tables"]["Event"]["Row"];
type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SponsoredRegistrationsFilterWrapperProps {
  event: Event;
  registrations: SponsoredRegistration[];
}

export function SponsoredRegistrationsFilterWrapper({
  event,
  registrations,
}: SponsoredRegistrationsFilterWrapperProps) {
  const [filteredRegistrations, setFilteredRegistrations] =
    useState(registrations);

  return (
    <div className="space-y-6">
      <SponsoredRegistrationsFilter
        onFilter={setFilteredRegistrations}
        registrations={registrations}
      />
      <SponsoredRegistrationsList
        event={event}
        pageSize={10}
        registrations={filteredRegistrations}
      />
    </div>
  );
}
