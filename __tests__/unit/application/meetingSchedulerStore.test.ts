import { beforeEach, describe, expect, it } from "vitest";
import { useMeetingSchedulerStore } from "@/app/admin/application/_store/useMeetingSchedulerStore";

/**
 * ============================================================================
 * UNIT TESTS: useMeetingSchedulerStore (Zustand Store)
 * ============================================================================
 *
 * Tests the Zustand store that manages meeting scheduler form state
 * with localStorage persistence for the interview venue.
 */

describe("useMeetingSchedulerStore", () => {
  beforeEach(() => {
    useMeetingSchedulerStore.getState().reset();
  });

  // ✅ HAPPY FLOW: Initial state has undefined date and empty venue
  it("should start with default state", () => {
    const { interviewDate, interviewVenue } =
      useMeetingSchedulerStore.getState();

    expect(interviewDate).toBeUndefined();
    expect(interviewVenue).toBe("");
  });

  // ✅ HAPPY FLOW: Set interview date
  it("should set interview date", () => {
    const date = new Date("2026-03-15T10:00:00Z");

    useMeetingSchedulerStore.getState().setInterviewDate(date);

    expect(useMeetingSchedulerStore.getState().interviewDate).toEqual(date);
  });

  // ✅ HAPPY FLOW: Set interview venue
  it("should set interview venue", () => {
    useMeetingSchedulerStore
      .getState()
      .setInterviewVenue("IBC Conference Room A");

    expect(useMeetingSchedulerStore.getState().interviewVenue).toBe(
      "IBC Conference Room A",
    );
  });

  // ✅ HAPPY FLOW: Reset clears all state
  it("should reset all state to defaults", () => {
    const store = useMeetingSchedulerStore.getState();
    store.setInterviewDate(new Date("2026-03-15T10:00:00Z"));
    store.setInterviewVenue("Some Venue");

    store.reset();

    const resetState = useMeetingSchedulerStore.getState();
    expect(resetState.interviewDate).toBeUndefined();
    expect(resetState.interviewVenue).toBe("");
  });

  // ✅ HAPPY FLOW: Update date multiple times
  it("should update interview date when changed multiple times", () => {
    const store = useMeetingSchedulerStore.getState();
    const date1 = new Date("2026-03-15T10:00:00Z");
    const date2 = new Date("2026-04-20T14:00:00Z");

    store.setInterviewDate(date1);
    expect(useMeetingSchedulerStore.getState().interviewDate).toEqual(date1);

    store.setInterviewDate(date2);
    expect(useMeetingSchedulerStore.getState().interviewDate).toEqual(date2);
  });

  // ✅ HAPPY FLOW: Set date to undefined
  it("should allow clearing interview date to undefined", () => {
    const store = useMeetingSchedulerStore.getState();

    store.setInterviewDate(new Date("2026-03-15T10:00:00Z"));
    store.setInterviewDate(undefined);

    expect(useMeetingSchedulerStore.getState().interviewDate).toBeUndefined();
  });

  // ✅ HAPPY FLOW: Update venue after setting it
  it("should allow overwriting interview venue", () => {
    const store = useMeetingSchedulerStore.getState();

    store.setInterviewVenue("Room A");
    store.setInterviewVenue("Room B");

    expect(useMeetingSchedulerStore.getState().interviewVenue).toBe("Room B");
  });

  // ❌ ERROR FLOW: Empty venue string should be accepted (validation is at form level)
  it("should accept empty venue string", () => {
    const store = useMeetingSchedulerStore.getState();

    store.setInterviewVenue("Some Venue");
    store.setInterviewVenue("");

    expect(useMeetingSchedulerStore.getState().interviewVenue).toBe("");
  });
});
