import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateSession } from "@/lib/supabase/proxy";

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

type MockState = {
  user: { id: string } | null;
  assuranceLevel: "aal1" | "aal2";
  factors: Array<{ factor_type: "totp"; status: "verified" | "unverified" }>;
};

const mockedCreateServerClient = vi.mocked(createServerClient);

function setupSupabaseMock(state: MockState): void {
  mockedCreateServerClient.mockReturnValue({
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: state.user }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      mfa: {
        getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
          data: { currentLevel: state.assuranceLevel },
          error: null,
        }),
        listFactors: vi.fn().mockResolvedValue({
          data: { all: state.factors },
          error: null,
        }),
      },
    },
  } as never);
}

function createRequest(pathname: string): NextRequest {
  return new NextRequest(`https://example.com${pathname}`);
}

function getRedirectPath(response: Response): string | null {
  const location = response.headers.get("location");
  if (!location) {
    return null;
  }

  return new URL(location).pathname;
}

describe("lib/supabase/proxy", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users from admin to auth", async () => {
    setupSupabaseMock({
      user: null,
      assuranceLevel: "aal1",
      factors: [],
    });

    const response = await updateSession(createRequest("/admin"));

    expect(getRedirectPath(response)).toBe("/auth");
  });

  it("redirects authenticated users without MFA setup to mfa-setup", async () => {
    setupSupabaseMock({
      user: { id: "user-1" },
      assuranceLevel: "aal1",
      factors: [],
    });

    const response = await updateSession(createRequest("/admin"));

    expect(getRedirectPath(response)).toBe("/auth/mfa-setup");
  });

  it("redirects authenticated users with MFA setup but aal1 to mfa-verify", async () => {
    setupSupabaseMock({
      user: { id: "user-1" },
      assuranceLevel: "aal1",
      factors: [{ factor_type: "totp", status: "verified" }],
    });

    const response = await updateSession(createRequest("/admin"));

    expect(getRedirectPath(response)).toBe("/auth/mfa-verify");
  });

  it("allows authenticated aal2 users to access admin", async () => {
    setupSupabaseMock({
      user: { id: "user-1" },
      assuranceLevel: "aal2",
      factors: [{ factor_type: "totp", status: "verified" }],
    });

    const response = await updateSession(createRequest("/admin"));

    expect(getRedirectPath(response)).toBeNull();
    expect(response.status).toBe(200);
  });
});
