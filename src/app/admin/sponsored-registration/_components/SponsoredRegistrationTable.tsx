import type { SponsoredRegistrationWithEvent } from "@/server/sponsored-registrations/queries/getAllSponsoredRegistrations";
import { getAllSponsoredRegistrationsWithEvent } from "@/server/sponsored-registrations/queries/getAllSponsoredRegistrations";
import { SponsoredRegistrationFilterWrapper } from "./SponsoredRegistrationFilterWrapper";

interface SponsoredRegistrationTableProps {
  registrations: SponsoredRegistrationWithEvent[];
}

function SponsoredRegistrationTableContent({
  registrations,
}: SponsoredRegistrationTableProps) {
  return <SponsoredRegistrationFilterWrapper registrations={registrations} />;
}

export async function SponsoredRegistrationTable() {
  try {
    console.log("[SponsoredRegistrationTable] Loading sponsored registrations");
    const registrations = await getAllSponsoredRegistrationsWithEvent();
    console.log("[SponsoredRegistrationTable] Loaded registrations:", {
      count: registrations.length,
    });
    return <SponsoredRegistrationTableContent registrations={registrations} />;
  } catch (_error) {
    console.error(
      "[SponsoredRegistrationTable] Error loading registrations:",
      _error,
    );
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-destructive">
          Failed to load sponsored registrations. Please try again later.
        </p>
      </div>
    );
  }
}
