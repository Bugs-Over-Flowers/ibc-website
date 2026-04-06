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
