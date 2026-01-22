import { randomUUID } from "node:crypto";
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

/**
 * Seed unique test data for E2E registration tests
 * Creates an event and optionally a business member
 */
export async function seedE2ERegistrationData(options?: {
  eventType?: "public" | "private";
  createBusinessMember?: boolean;
}): Promise<E2ETestData> {
  const timestamp = Date.now();
  const supabase = createE2EAdminClient();

  // Create test event
  const eventData: EventInsert = {
    eventTitle: `E2E Test Event ${timestamp}`,
    description: "Test event for E2E registration flow testing",
    eventStartDate: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    eventEndDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    venue: "E2E Test Venue",
    eventType: options?.eventType ?? "public",
    registrationFee: 500,
    eventHeaderUrl: "https://picsum.photos/800/400",
    maxGuest: 10,
    publishedAt: new Date().toISOString(), // Make event visible
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
      sectorId: 1, // Technology (from seed.sql)
      websiteURL: "https://e2e-test.local",
      logoImageURL: "https://picsum.photos/200/200",
      joinDate: new Date().toISOString(),
      membershipStatus: "active", // Valid enum value
      lastPaymentDate: new Date().toISOString(),
      membershipExpiryDate: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
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
