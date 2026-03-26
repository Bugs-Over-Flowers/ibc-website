import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { searchDashboardActivity } from "@/server/admin/queries/getDashboardData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") ?? "";

    const cookieStore = await cookies();
    const activities = await searchDashboardActivity(
      cookieStore.getAll(),
      query,
    );

    return NextResponse.json({ activities });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        activities: [],
        error: message,
      },
      { status: 500 },
    );
  }
}
