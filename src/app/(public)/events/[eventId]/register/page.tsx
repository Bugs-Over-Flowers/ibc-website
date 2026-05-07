import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { RegistrationRouteProps } from "@/lib/types/route";

export const metadata: Metadata = {
  title: "Event Registration",
  description: "Complete your registration for this event.",
};

interface SponsoredRegisterPageProps extends RegistrationRouteProps {
  searchParams: Promise<{ sr?: string | string[] }>;
}

export default async function Page({
  params,
  searchParams,
}: SponsoredRegisterPageProps) {
  const { eventId } = await params;
  const { sr: sponsorUuid } = await searchParams;

  const sponsorUuidRaw =
    typeof sponsorUuid === "string"
      ? sponsorUuid
      : Array.isArray(sponsorUuid)
        ? sponsorUuid[0]
        : undefined;

  const normalizedSponsorUuid = sponsorUuidRaw?.trim();
  const query = normalizedSponsorUuid
    ? `?sr=${encodeURIComponent(normalizedSponsorUuid)}`
    : "";

  redirect(`/registration/${eventId}${query}`);
}
