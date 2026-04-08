// POST /api/internal/members/status-transitions
// Manual/fallback trigger for membership status transitions.
//
// PRIMARY EXECUTION: pg_cron jobs run automatically:
//   - Daily at 12:05 AM PH (membership-daily-ph)
//   - Yearly at Jan 1 12:00 AM PH (membership-january-first-ph)
//
// SECONDARY USE (this endpoint):
//   - Manual on-demand triggers (bypass schedule, run immediately)
//   - Fallback if cron fails or is delayed
//   - External systems / monitoring hooks
//   - Testing and debugging
//
// See: supabase/migrations/20260404123000_align_membership_transition_logic.sql

import { NextResponse } from "next/server";
import {
  resetMemberStatuses,
  updateCancelledMembers,
} from "@/server/members/mutations/membershipStatusTransition";

type RunMode = "january-reset" | "process-now";

function isAuthorized(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;

  // If no secret is configured, allow internal calls by default.
  if (!expectedSecret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");

  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  return bearerToken === expectedSecret || headerSecret === expectedSecret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let mode: RunMode = "process-now";

  try {
    const body = (await request.json()) as { mode?: RunMode };
    if (body.mode === "january-reset" || body.mode === "process-now") {
      mode = body.mode;
    }
  } catch {
    // Empty or invalid JSON falls back to process-now.
  }

  try {
    if (mode === "january-reset") {
      const result = await resetMemberStatuses();
      return NextResponse.json({ mode, ...result });
    }

    const result = await updateCancelledMembers(new Date());
    return NextResponse.json({ mode, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
