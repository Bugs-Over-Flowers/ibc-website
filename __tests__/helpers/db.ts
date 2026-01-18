import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/db.types";
import { createAdminClient } from "@/lib/supabase/server";
import { checkTestEnvironment } from "./env";

/**
 * Database utilities for testing
 * Provides functions to reset and seed test database
 */

/**
 * Resets the test database to a clean state
 * WARNING: This will delete all data in the database!
 */
export async function resetTestDatabase() {
  checkTestEnvironment();

  await createTestSupabaseClient();

  // Note: In a real implementation, you would:
  // 1. Truncate all tables
  // 2. Reset sequences
  // 3. Re-seed with test data
  //
  // For now, we'll rely on `supabase db reset` CLI command
  // which is safer and more reliable

  console.log("Database reset - use `supabase db reset` for full reset");
}

/**
 * Seeds the test database with sample data
 * This runs the supabase/seed.sql file
 */
export async function seedTestDatabase() {
  checkTestEnvironment();

  // Note: Seeding is done via SQL file at supabase/seed.sql
  // Run: supabase db reset (which automatically seeds)
  console.log("Database seeding - use `supabase db reset` for seeding");
}

/**
 * Helper to create a test Supabase client with admin privileges
 * Uses local Supabase instance from .env.testing with service role key
 *
 * IMPORTANT: This bypasses Row Level Security (RLS)
 *
 * USE THIS FOR:
 * - Database setup/teardown
 * - Seeding test data
 * - Cleaning up after tests
 * - Tests that need to bypass RLS
 *
 * DON'T USE THIS FOR:
 * - Authentication tests (use createTestAuthClient instead)
 * - Testing RLS policies (use createTestAuthClient instead)
 */
export async function createTestSupabaseClient() {
  checkTestEnvironment();

  // Verify we're using local Supabase
  getSupabaseEnv();

  // Use admin client to bypass RLS and cookie requirements
  // This is safe in tests since we're using local Supabase
  return createAdminClient();
}

/**
 * Helper to create an authenticated/unauthenticated Supabase client for testing
 * Uses the anon key (same as production) and respects RLS policies
 *
 * USE THIS FOR:
 * - Authentication tests (login, signup, logout)
 * - Testing RLS policies
 * - Testing authorized vs unauthorized access
 * - Integration tests that simulate real user behavior
 *
 * @example
 * // Test unauthenticated access
 * const client = createTestAuthClient();
 * const { data, error } = await client.from('protected_table').select();
 * expect(error).toBeTruthy(); // Should fail due to RLS
 *
 * @example
 * // Test authenticated access
 * const client = createTestAuthClient();
 * await client.auth.signInWithPassword({ email, password });
 * const { data, error } = await client.from('protected_table').select();
 * expect(data).toBeTruthy(); // Should succeed if RLS allows
 */
export function createTestAuthClient() {
  checkTestEnvironment();

  // Verify we're using local Supabase
  const { supabaseUrl, supabaseKey } = getSupabaseEnv();

  // Create browser client with anon key (respects RLS, allows auth)
  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Clean up test data after each test
 * Truncates specified tables
 */
export async function cleanupTestData(tables: string[]) {
  checkTestEnvironment();

  await createTestSupabaseClient();

  // In practice, you'd iterate through tables and delete data
  // For now, we recommend using beforeEach/afterEach hooks
  // with specific data cleanup per test

  console.log(`Cleanup would run for tables: ${tables.join(", ")}`);
}

/**
 * Create test user for authentication tests
 * Uses admin client to create user without email confirmation
 */
export async function createTestUser(email: string, password: string) {
  // Use admin client to bypass email confirmation
  const supabase = await createTestSupabaseClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email in tests
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete test user
 * Uses admin client to delete user
 */
export async function deleteTestUser(userId: string) {
  const supabase = await createTestSupabaseClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw error;
  }
}
/**
 * Helper to get and validate Supabase environment variables for tests
 * @returns supabaseUrl and supabaseKey
 */
function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  if (
    !supabaseUrl?.includes("127.0.0.1") &&
    !supabaseUrl?.includes("localhost")
  ) {
    throw new Error(
      "Test environment must use local Supabase! Check .env.testing",
    );
  }

  return { supabaseUrl, supabaseKey };
}
