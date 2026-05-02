import { expect, type Page } from "@playwright/test";

export function getFeaturedMemberByName(page: Page, businessName: string) {
  return page.locator("article", { hasText: businessName });
}

export async function openAdminMembersPage(page: Page): Promise<void> {
  await page.goto("/admin/members");
  await expect(page).toHaveURL(/\/admin\/members$/);
}

export async function openPublicMembersPage(page: Page): Promise<void> {
  await page.goto("/members");
  await expect(page).toHaveURL(/\/members$/);
}
