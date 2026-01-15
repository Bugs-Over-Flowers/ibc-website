import { useState } from "react";

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
  // Store selections per tab
  const [newTabSelections, setNewTabSelections] = useState<Set<string>>(
    new Set(),
  );
  const [pendingTabSelections, setPendingTabSelections] = useState<Set<string>>(
    new Set(),
  );

  // Save current selections when switching tabs
  const handleTabChange = (newTab: "new" | "pending" | "finished") => {
    // Save current tab's selections
    if (activeTab === "new") {
      setNewTabSelections(new Set(selectedApplicationIds));
    } else if (activeTab === "pending") {
      setPendingTabSelections(new Set(selectedApplicationIds));
    }

    // Restore new tab's selections
    if (newTab === "new") {
      if (newTabSelections.size > 0) {
        selectAll(Array.from(newTabSelections));
      } else {
        clearSelection();
      }
    } else if (newTab === "pending") {
      if (pendingTabSelections.size > 0) {
        selectAll(Array.from(pendingTabSelections));
      } else {
        clearSelection();
      }
    } else {
      clearSelection();
    }
  };

  return { handleTabChange };
}
