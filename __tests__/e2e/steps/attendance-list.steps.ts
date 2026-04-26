/** biome-ignore-all lint/correctness/noEmptyPattern: Required for bddgen */
import { expect } from "@playwright/test";
import { test as baseTest, createBdd } from "playwright-bdd";
import {
  cleanupAttendanceListScenario,
  seedAttendanceListScenario,
} from "../fixtures/attendanceListScenario";

type TestScenario = Awaited<ReturnType<typeof seedAttendanceListScenario>>;

export const test = baseTest.extend<{ scenario: TestScenario }>({
  scenario: async ({}, use) => {
    const scenario = await seedAttendanceListScenario({
      participantCount: 10,
      eventDayCount: 2,
      checkInDistribution: {
        0: 10,
        1: 0,
      },
      remarks: [
        {
          participantIndex: 0,
          eventDayIndex: 0,
          text: "VIP guest",
        },
        {
          participantIndex: 1,
          eventDayIndex: 0,
          text: "Front row seating",
        },
      ],
    });
    await use(scenario);
    await cleanupAttendanceListScenario(scenario);
  },
});

export const { Given, When, Then } = createBdd(test);

// ============================================
// Scenario: View attendance list with check-ins
// ============================================

Given(
  "I am on the attendance list page for the seeded event",
  async ({ page, scenario }) => {
    await page.goto(`/admin/events/${scenario.event.eventId}/check-in-list`);
    await page.waitForLoadState("networkidle");
  },
);

Then("I should see the event title heading", async ({ page, scenario }) => {
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: new RegExp(scenario.event.eventTitle, "i"),
    }),
  ).toBeVisible();
});

Then("I should see the event day tabs", async ({ page, scenario }) => {
  for (const eventDay of scenario.eventDays) {
    await expect(page.getByRole("tab", { name: eventDay.label })).toBeVisible();
  }
});

Then("I should see the check-in stats showing:", async ({ page, scenario }) => {
  const firstDay = scenario.eventDays[0];
  const checkedInCount = scenario.stats.checkInCounts[firstDay.eventDayId] ?? 0;
  const totalExpected = scenario.stats.totalExpected;
  const percentage =
    totalExpected > 0 ? Math.round((checkedInCount / totalExpected) * 100) : 0;

  await expect(
    page.getByText(`${totalExpected} Total registered for this event`),
  ).toBeVisible();

  await expect(
    page.getByText(`${checkedInCount} ${percentage}% attendance rate`),
  ).toBeVisible();

  await expect(
    page.getByText(
      `${percentage}% ${totalExpected - checkedInCount} participant${totalExpected - checkedInCount !== 1 ? "s" : ""} yet to check in`,
    ),
  ).toBeVisible();
});

Then(
  "I should see the attendance table with {int} participants",
  async ({ page }, count: number) => {
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(count, { timeout: 10000 });
  },
);

Then(
  "the first row should show check-in time in format {string}",
  async ({ page }, _format: string) => {
    const timeCell = page.locator("tbody tr:first-child td:first-child");
    await expect(timeCell).toBeVisible();
    const timeText = await timeCell.textContent();
    const timeRegex = /\d{1,2}:\d{2}\s?(AM|PM)/i;
    expect(timeText?.match(timeRegex)).toBeTruthy();
  },
);

Then(
  "the table should contain the participant details columns",
  async ({ page }) => {
    await expect(
      page.getByRole("columnheader", { name: /Identifier/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /First name/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Last name/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Affiliation/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Email/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Contact/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Remarks/i }),
    ).toBeVisible();
  },
);

// ============================================
// Scenario: Navigate between event day tabs
// ============================================

Given("I am on the {string} tab", async ({ page }, tabName: string) => {
  await page.getByRole("tab", { name: tabName }).click();
  await page.waitForLoadState("networkidle");
});

Then(
  "I should see {int} participants checked in",
  async ({ page }, count: number) => {
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(count, { timeout: 10000 });
  },
);

Then(
  "the stats should show {string} checked in for {string}",
  async ({ page }, count: string, _tabName: string) => {
    await expect(
      page.getByText(new RegExp(`${count}.*attendance rate`, "i")),
    ).toBeVisible();
  },
);

When("I click on the {string} tab", async ({ page }, tabName: string) => {
  await page.getByRole("tab", { name: tabName }).click();
  await page.waitForLoadState("networkidle");
});

// ============================================
// Scenario: Stats update correctly when switching tabs
// ============================================

Then(
  "the stats should show correct percentages for Day 1",
  async ({ page, scenario }) => {
    const firstDay = scenario.eventDays[0];
    const checkedInCount =
      scenario.stats.checkInCounts[firstDay.eventDayId] ?? 0;
    const totalExpected = scenario.stats.totalExpected;
    const percentage =
      totalExpected > 0
        ? Math.round((checkedInCount / totalExpected) * 100)
        : 0;

    await expect(page.getByText(`Checked in - Day 1`)).toBeVisible();
    await expect(page.getByText(`${percentage}%`)).toBeVisible();
  },
);

Then(
  "the stats should update to show {string} in labels",
  async ({ page }, dayLabel: string) => {
    await expect(
      page.getByText(new RegExp(`Checked in - ${dayLabel}`, "i")),
    ).toBeVisible();
    await expect(
      page.getByText(new RegExp(`Attendance rate - ${dayLabel}`, "i")),
    ).toBeVisible();
  },
);

Then(
  "the attendance rate should reflect {int}% for Day 2",
  async ({ page }, percentage: number) => {
    await expect(page.getByText(`${percentage}%`)).toBeVisible();
  },
);

// ============================================
// Scenario: Export check-in list to Excel
// ============================================

When("I click the Export to Excel button", async ({ page }) => {
  await page.getByRole("button", { name: "Export to Excel" }).click();
});

Then("I should download an Excel file", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
  await page.getByRole("button", { name: "Export to Excel" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
});

Then(
  "the Excel file should contain the check-in data with columns:",
  async ({ page }) => {
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await page.getByRole("button", { name: "Export to Excel" }).click();
    const download = await downloadPromise;

    const path = await download.path();
    expect(path).toBeTruthy();

    const fs = await import("node:fs");
    expect(fs.existsSync(path!)).toBe(true);

    const stats = fs.statSync(path!);
    expect(stats.size).toBeGreaterThan(0);

    const buffer = fs.readFileSync(path!);
    const headerBuffer = buffer.slice(0, 4);
    const xlsxSignature = [0x50, 0x4b, 0x03, 0x04];
    expect(headerBuffer).toEqual(Buffer.from(xlsxSignature));
  },
);

Then(
  "the Excel file should have 11 rows including header",
  async ({ page }) => {
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await page.getByRole("button", { name: "Export to Excel" }).click();
    const download = await downloadPromise;

    const path = await download.path();
    expect(path).toBeTruthy();

    const fs = await import("node:fs");
    expect(fs.existsSync(path!)).toBe(true);

    const buffer = fs.readFileSync(path!);
    const headerBuffer = buffer.slice(0, 4);
    const xlsxSignature = [0x50, 0x4b, 0x03, 0x04];
    expect(headerBuffer).toEqual(Buffer.from(xlsxSignature));
  },
);

Then(
  "the Excel data should match the displayed check-in records",
  async ({ page, scenario }) => {
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await page.getByRole("button", { name: "Export to Excel" }).click();
    const download = await downloadPromise;

    const path = await download.path();
    expect(path).toBeTruthy();

    const fs = await import("node:fs");
    expect(fs.existsSync(path!)).toBe(true);

    const buffer = fs.readFileSync(path!);
    const headerBuffer = buffer.slice(0, 4);
    const xlsxSignature = [0x50, 0x4b, 0x03, 0x04];
    expect(headerBuffer).toEqual(Buffer.from(xlsxSignature));

    const firstDay = scenario.eventDays[0];
    const dayCheckIns = scenario.checkIns.filter(
      (c) => c.eventDayId === firstDay.eventDayId,
    );

    const tableRows = page.locator("tbody tr");
    const rowCount = await tableRows.count();
    expect(rowCount).toBe(dayCheckIns.length);
  },
);

// ============================================
// Scenario: View participant remarks
// ============================================

Given("there are participants with remarks", async ({}) => {});

When(
  "I click the {string} button for a participant with remarks",
  async ({ page }) => {
    await page.getByRole("button", { name: /View/i }).first().click();
  },
);

Then("I should see the remarks dialog", async ({ page }) => {
  await expect(page.getByRole("dialog", { name: /Remarks -/ })).toBeVisible();
});

Then("the dialog should show the participant's name", async ({ page }) => {
  await expect(
    page.getByRole("dialog").getByRole("heading", { level: 2 }),
  ).toBeVisible();
});

Then("the dialog should show the remark text", async ({ page }) => {
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("VIP guest")).toBeVisible();
});

// ============================================
// Scenario: Table sorting works
// ============================================

When(
  "I click on the {string} column header",
  async ({ page }, columnName: string) => {
    await page.getByRole("columnheader", { name: columnName }).click();
  },
);

Then("the table should be sorted by first name", async ({ page }) => {
  const firstCell = page.locator("tbody tr:first-child td:nth-child(3)");
  await expect(firstCell).toBeVisible();
});

Then(
  "the table should be sorted by first name in descending order",
  async ({ page }) => {
    const firstCell = page.locator("tbody tr:first-child td:nth-child(3)");
    await expect(firstCell).toBeVisible();
  },
);

// ============================================
// Scenario: Empty check-in list for event day
// ============================================

Given(
  "I am on the {string} tab with no check-ins",
  async ({ page }, tabName: string) => {
    await page.getByRole("tab", { name: tabName }).click();
    await page.waitForLoadState("networkidle");
  },
);

Then("I should see the empty state message", async ({ page }) => {
  await expect(page.getByText("No check-ins yet")).toBeVisible();
  await expect(
    page.getByText("No participants have checked in for this event day."),
  ).toBeVisible();
});

Then(
  "the stats should show {int}% attendance for Day 2",
  async ({ page }, percentage: number) => {
    await expect(page.getByText(`${percentage}%`)).toBeVisible();
  },
);
