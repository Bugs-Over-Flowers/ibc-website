import { beforeEach, describe, expect, it } from "vitest";
import { useSelectedApplicationsStore } from "@/app/admin/application/_store/useSelectedApplicationsStore";

/**
 * ============================================================================
 * UNIT TESTS: useSelectedApplicationsStore (Zustand Store)
 * ============================================================================
 *
 * Tests the Zustand store that manages application selection state.
 * This store is used across the ApplicationsTable, ApplicationBulkActions,
 * and MeetingScheduler components.
 */

describe("useSelectedApplicationsStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useSelectedApplicationsStore.getState().clearSelection();
  });

  // ✅ HAPPY FLOW: Initial state is empty
  it("should start with empty selection", () => {
    const { selectedApplicationIds } = useSelectedApplicationsStore.getState();

    expect(selectedApplicationIds.size).toBe(0);
  });

  // ✅ HAPPY FLOW: Toggle selection adds application
  it("should add application when toggling unselected application", () => {
    const store = useSelectedApplicationsStore.getState();

    store.toggleSelection("app-001");

    const { selectedApplicationIds } = useSelectedApplicationsStore.getState();
    expect(selectedApplicationIds.has("app-001")).toBe(true);
    expect(selectedApplicationIds.size).toBe(1);
  });

  // ✅ HAPPY FLOW: Toggle selection removes already selected application
  it("should remove application when toggling already selected application", () => {
    const store = useSelectedApplicationsStore.getState();

    store.toggleSelection("app-001"); // Select
    store.toggleSelection("app-001"); // Deselect

    const { selectedApplicationIds } = useSelectedApplicationsStore.getState();
    expect(selectedApplicationIds.has("app-001")).toBe(false);
    expect(selectedApplicationIds.size).toBe(0);
  });

  // ✅ HAPPY FLOW: Select multiple applications
  it("should handle selecting multiple applications", () => {
    const store = useSelectedApplicationsStore.getState();

    store.toggleSelection("app-001");
    store.toggleSelection("app-002");
    store.toggleSelection("app-003");

    const { selectedApplicationIds } = useSelectedApplicationsStore.getState();
    expect(selectedApplicationIds.size).toBe(3);
    expect(selectedApplicationIds.has("app-001")).toBe(true);
    expect(selectedApplicationIds.has("app-002")).toBe(true);
    expect(selectedApplicationIds.has("app-003")).toBe(true);
  });

  // ✅ HAPPY FLOW: Select all applications at once
  it("should select all provided application IDs", () => {
    const store = useSelectedApplicationsStore.getState();

    store.selectAll(["app-001", "app-002", "app-003"]);

    const { selectedApplicationIds } = useSelectedApplicationsStore.getState();
    expect(selectedApplicationIds.size).toBe(3);
  });

  // ✅ HAPPY FLOW: Select all replaces previous selection
  it("should replace previous selection when selectAll is called", () => {
    const store = useSelectedApplicationsStore.getState();

    store.selectAll(["app-001", "app-002"]);
    store.selectAll(["app-003", "app-004"]);

    const { selectedApplicationIds } = useSelectedApplicationsStore.getState();
    expect(selectedApplicationIds.size).toBe(2);
    expect(selectedApplicationIds.has("app-001")).toBe(false);
    expect(selectedApplicationIds.has("app-003")).toBe(true);
    expect(selectedApplicationIds.has("app-004")).toBe(true);
  });

  // ✅ HAPPY FLOW: Clear selection empties the store
  it("should clear all selections", () => {
    const store = useSelectedApplicationsStore.getState();

    store.selectAll(["app-001", "app-002", "app-003"]);
    store.clearSelection();

    const { selectedApplicationIds } = useSelectedApplicationsStore.getState();
    expect(selectedApplicationIds.size).toBe(0);
  });

  // ✅ HAPPY FLOW: isSelected returns correct boolean
  it("should correctly report whether an application is selected", () => {
    const store = useSelectedApplicationsStore.getState();

    store.toggleSelection("app-001");

    expect(store.isSelected("app-001")).toBe(true);
    expect(store.isSelected("app-002")).toBe(false);
  });

  // ✅ HAPPY FLOW: Remove single application from selection
  it("should remove a specific application from selection", () => {
    const store = useSelectedApplicationsStore.getState();

    store.selectAll(["app-001", "app-002", "app-003"]);
    store.removeApplication("app-002");

    const { selectedApplicationIds } = useSelectedApplicationsStore.getState();
    expect(selectedApplicationIds.size).toBe(2);
    expect(selectedApplicationIds.has("app-002")).toBe(false);
    expect(selectedApplicationIds.has("app-001")).toBe(true);
    expect(selectedApplicationIds.has("app-003")).toBe(true);
  });

  // ❌ ERROR FLOW: Remove non-existent application (should not throw)
  it("should handle removing non-existent application gracefully", () => {
    const store = useSelectedApplicationsStore.getState();

    store.selectAll(["app-001"]);

    expect(() => store.removeApplication("app-999")).not.toThrow();
    expect(
      useSelectedApplicationsStore.getState().selectedApplicationIds.size,
    ).toBe(1);
  });

  // ❌ ERROR FLOW: Toggle same application multiple times (odd = selected, even = deselected)
  it("should correctly toggle application on rapid toggle", () => {
    const store = useSelectedApplicationsStore.getState();

    store.toggleSelection("app-001"); // selected
    store.toggleSelection("app-001"); // deselected
    store.toggleSelection("app-001"); // selected

    expect(
      useSelectedApplicationsStore
        .getState()
        .selectedApplicationIds.has("app-001"),
    ).toBe(true);
  });

  // ❌ ERROR FLOW: Clear selection on empty store
  it("should handle clearing already empty selection", () => {
    const store = useSelectedApplicationsStore.getState();

    expect(() => store.clearSelection()).not.toThrow();
    expect(
      useSelectedApplicationsStore.getState().selectedApplicationIds.size,
    ).toBe(0);
  });

  // ✅ HAPPY FLOW: Select all with empty array
  it("should handle selectAll with empty array", () => {
    const store = useSelectedApplicationsStore.getState();

    store.selectAll(["app-001", "app-002"]);
    store.selectAll([]);

    expect(
      useSelectedApplicationsStore.getState().selectedApplicationIds.size,
    ).toBe(0);
  });

  // ✅ HAPPY FLOW: Duplicate IDs in selectAll are deduplicated (Set behavior)
  it("should deduplicate IDs in selectAll", () => {
    const store = useSelectedApplicationsStore.getState();

    store.selectAll(["app-001", "app-001", "app-002"]);

    expect(
      useSelectedApplicationsStore.getState().selectedApplicationIds.size,
    ).toBe(2);
  });
});
