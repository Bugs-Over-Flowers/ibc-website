import { useEffect, useRef } from "react";

type SelectionKey =
  `${"interview" | "updating"}:${"new" | "pending" | "finished"}`;

const getSelectionKey = (
  group: "interview" | "updating",
  tab: "new" | "pending" | "finished",
): SelectionKey => `${group}:${tab}`;

interface UseTabSelectionsProps {
  activeTab: "new" | "pending" | "finished";
  activeGroup: "interview" | "updating";
  selectedApplicationIds: string[];
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

export function useTabSelections({
  activeTab,
  activeGroup,
  selectedApplicationIds,
  clearSelection,
  selectAll,
}: UseTabSelectionsProps) {
  // Store selections per tab using a ref to avoid race conditions
  const tabSelectionsRef = useRef<Record<SelectionKey, string[]>>({
    "interview:new": [],
    "interview:pending": [],
    "interview:finished": [],
    "updating:new": [],
    "updating:pending": [],
    "updating:finished": [],
  });

  // Sync current tab's selections whenever selectedApplicationIds changes
  useEffect(() => {
    const key = getSelectionKey(activeGroup, activeTab);
    tabSelectionsRef.current[key] = selectedApplicationIds;
  }, [activeGroup, activeTab, selectedApplicationIds]);

  // Save current selections when switching tabs and restore target tab's selections
  const handleTabChange = (newTab: "new" | "pending" | "finished") => {
    const key = getSelectionKey(activeGroup, newTab);
    const targetTabSelections = tabSelectionsRef.current[key];

    if (targetTabSelections.length > 0) {
      selectAll(targetTabSelections);
    } else {
      clearSelection();
    }
  };

  return { handleTabChange };
}
