"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface SelectedApplicationsContextType {
  selectedApplicationIds: Set<string>;
  toggleSelection: (applicationId: string) => void;
  selectAll: (applicationIds: string[]) => void;
  clearSelection: () => void;
  isSelected: (applicationId: string) => boolean;
}

const SelectedApplicationsContext = createContext<
  SelectedApplicationsContextType | undefined
>(undefined);

export function SelectedApplicationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<
    Set<string>
  >(new Set());

  const toggleSelection = (applicationId: string) => {
    setSelectedApplicationIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  const selectAll = (applicationIds: string[]) => {
    setSelectedApplicationIds(new Set(applicationIds));
  };

  const clearSelection = () => {
    setSelectedApplicationIds(new Set());
  };

  const isSelected = (applicationId: string) => {
    return selectedApplicationIds.has(applicationId);
  };

  return (
    <SelectedApplicationsContext.Provider
      value={{
        selectedApplicationIds,
        toggleSelection,
        selectAll,
        clearSelection,
        isSelected,
      }}
    >
      {children}
    </SelectedApplicationsContext.Provider>
  );
}

export function useSelectedApplications() {
  const context = useContext(SelectedApplicationsContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedApplications must be used within SelectedApplicationsProvider",
    );
  }
  return context;
}
