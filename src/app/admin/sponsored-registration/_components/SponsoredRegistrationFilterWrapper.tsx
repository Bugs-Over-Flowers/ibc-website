"use client";

import { useState } from "react";
import type { SponsoredRegistrationWithEvent } from "@/server/sponsored-registrations/queries/getAllSponsoredRegistrations";
import { SponsoredRegistrationFilter } from "./SponsoredRegistrationFilter";
import { SponsoredRegistrationList } from "./SponsoredRegistrationList";

interface SponsoredRegistrationFilterWrapperProps {
  registrations: SponsoredRegistrationWithEvent[];
}

export function SponsoredRegistrationFilterWrapper({
  registrations,
}: SponsoredRegistrationFilterWrapperProps) {
  const [filteredRegistrations, setFilteredRegistrations] =
    useState(registrations);

  return (
    <div className="space-y-6">
      <SponsoredRegistrationFilter
        onFilter={setFilteredRegistrations}
        registrations={registrations}
      />
      <SponsoredRegistrationList
        pageSize={10}
        registrations={filteredRegistrations}
      />
    </div>
  );
}
