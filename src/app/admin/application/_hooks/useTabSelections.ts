import { useEffect, useRef } from "react";

interface UseTabSelectionsProps {
  activeTab: "new" | "pending" | "finished";
  selectedApplicationIds: string[];
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

export function useTabSelections({
  activeTab,
  selectedApplicationIds,
  clearSelection,
  selectAll,
}: UseTabSelectionsProps) {
  // Store selections per tab using a ref to avoid race conditions
  const tabSelectionsRef = useRef<
    Record<"new" | "pending" | "finished", string[]>
  >({
    new: [],
    pending: [],
    finished: [],
  });

  // Sync current tab's selections whenever selectedApplicationIds changes
  useEffect(() => {
    tabSelectionsRef.current[activeTab] = selectedApplicationIds;
  }, [activeTab, selectedApplicationIds]);

  // Save current selections when switching tabs and restore target tab's selections
  const handleTabChange = (newTab: "new" | "pending" | "finished") => {
    // Current tab's selections are already synced via useEffect
    // Get target tab's saved selections
    const targetTabSelections = tabSelectionsRef.current[newTab];

    if (targetTabSelections.length > 0) {
      selectAll(targetTabSelections);
    } else {
      clearSelection();
    }
  };

  return { handleTabChange };
}
