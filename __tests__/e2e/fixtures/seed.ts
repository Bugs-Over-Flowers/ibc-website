import type { Database } from "@/lib/supabase/db.types";
import { createE2EAdminClient } from "../helpers/supabase";

type EventInsert = Database["public"]["Tables"]["Event"]["Insert"];
type BusinessMemberInsert =
  Database["public"]["Tables"]["BusinessMember"]["Insert"];

export interface E2ETestData {
  timestamp: number;
  event: {
    eventId: string;
    eventTitle: string;
    eventType: "public" | "private";
    registrationFee: number;
  };
  businessMember?: {
    businessMemberId: string;
    businessName: string;
  };
}

interface SeedOptions {
  eventType?: "public" | "private";
  createBusinessMember?: boolean;
  eventTiming?: "upcoming" | "past";
  titlePrefix?: string;
}

/**
 * Minimal seed data for E2E registration tests.
 * Creates an event and optionally a business member.
 */
export async function seedE2ERegistrationData(
  options?: SeedOptions,
): Promise<E2ETestData> {
  const timestamp = Date.now();
  const supabase = createE2EAdminClient();
  const eventTiming = options?.eventTiming ?? "upcoming";
  const now = Date.now();

  const startOffsetDays = eventTiming === "past" ? -8 : 7;
  const endOffsetDays = eventTiming === "past" ? -7 : 8;

  // Create test event
  const eventData: EventInsert = {
    eventTitle: `${options?.titlePrefix ?? "E2E Test Event"} ${timestamp}`,
    description: "Test event for E2E registration flow testing",
    eventStartDate: new Date(
      now + startOffsetDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
    eventEndDate: new Date(
      now + endOffsetDays * 24 * 60 * 60 * 1000,
    ).toISOString(),
    venue: "E2E Test Venue",
    eventType: options?.eventType ?? "public",
    registrationFee: 500,
    eventHeaderUrl: "https://picsum.photos/800/400",
    eventPoster: null,
    facebookLink: null,
    publishedAt: new Date().toISOString(),
  };

  const { data: event, error: eventError } = await supabase
    .from("Event")
    .insert(eventData)
    .select()
    .single();

  if (eventError) {
    throw new Error(`Failed to seed event: ${eventError.message}`);
  }

  let businessMember:
    | {
        businessMemberId: string;
        businessName: string;
      }
    | undefined;

  // Create business member if requested (for member registration tests)
  if (options?.createBusinessMember) {
    const memberData: BusinessMemberInsert = {
      businessName: `E2E Test Company ${timestamp}`,
      identifier: `e2e-${timestamp}`,
      sectorId: 1,
      websiteURL: "https://e2e-test.local",
      logoImageURL: "https://picsum.photos/200/200",
      joinDate: new Date().toISOString(),
      membershipStatus: "paid",
      lastPaymentDate: new Date().toISOString(),
      featuredExpirationDate: null,
      membershipExpiryDate: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      primaryApplicationId: null,
    };

    const { data: member, error: memberError } = await supabase
      .from("BusinessMember")
      .insert(memberData)
      .select()
      .single();

    if (memberError) {
      throw new Error(`Failed to seed business member: ${memberError.message}`);
    }

    businessMember = {
      businessMemberId: member.businessMemberId,
      businessName: member.businessName,
    };
  }

  return {
    timestamp,
    event: {
      eventId: event.eventId,
      eventTitle: event.eventTitle,
      eventType: event.eventType as "public" | "private",
      registrationFee: event.registrationFee,
    },
    businessMember,
  };
}
