import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { checkTestEnvironment } from "./env";

// Setup runs before all tests
beforeAll(() => {
  console.log("🔧 Initializing test environment...");
  // Verify we're in test environment
  checkTestEnvironment();

  // Verify we're using local Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (
    !supabaseUrl?.includes("127.0.0.1") &&
    !supabaseUrl?.includes("localhost")
  ) {
    console.warn(
      "⚠️  WARNING: Not using local Supabase URL. Expected http://127.0.0.1:54321",
    );
    console.warn(`   Current URL: ${supabaseUrl}`);
    console.warn("   Make sure .env.testing is loaded correctly");
  }

  console.log("✓ Test environment initialized");
  console.log(`  Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`  Node ENV: ${process.env.NODE_ENV}`);
});

// Cleanup after each test
afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  // Reset all mocks
  vi.resetAllMocks();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
}));

// Mock Supabase client for tests
// Note: For integration tests that need real Supabase, you can override this mock
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));
