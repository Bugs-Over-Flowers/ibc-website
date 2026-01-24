"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSearchInputProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
}

export function useSearchInput({
  initialValue = "",
  onSearch,
  debounceMs = 300,
}: UseSearchInputProps) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Call onSearch with debouncing
      timeoutRef.current = setTimeout(() => {
        onSearch(value || "");
      }, debounceMs);
    },
    [onSearch, debounceMs],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    searchValue,
    setSearchValue,
    handleSearchChange,
  };
}
