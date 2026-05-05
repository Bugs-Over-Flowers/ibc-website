"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useRef } from "react";

type UploadFunction = () => Promise<void>;

interface PendingUploadsContextType {
  registerUploadFunction: (
    sectionKey: string,
    uploadFn: UploadFunction,
  ) => void;
  unregisterUploadFunction: (sectionKey: string) => void;
  uploadAllPendingImages: () => Promise<void>;
  hasPendingUploads: () => boolean;
}

const PendingUploadsContext = createContext<
  PendingUploadsContextType | undefined
>(undefined);

export function PendingUploadsProvider({ children }: { children: ReactNode }) {
  const uploadFunctionsRef = useRef<Map<string, UploadFunction>>(new Map());

  const registerUploadFunction = useCallback(
    (sectionKey: string, uploadFn: UploadFunction) => {
      uploadFunctionsRef.current.set(sectionKey, uploadFn);
    },
    [],
  );

  const unregisterUploadFunction = useCallback((sectionKey: string) => {
    uploadFunctionsRef.current.delete(sectionKey);
  }, []);

  const uploadAllPendingImages = useCallback(async () => {
    const uploadPromises = Array.from(uploadFunctionsRef.current.values()).map(
      (uploadFn) => uploadFn(),
    );
    await Promise.all(uploadPromises);
  }, []);

  const hasPendingUploads = useCallback(
    () => uploadFunctionsRef.current.size > 0,
    [],
  );

  return (
    <PendingUploadsContext.Provider
      value={{
        registerUploadFunction,
        unregisterUploadFunction,
        uploadAllPendingImages,
        hasPendingUploads,
      }}
    >
      {children}
    </PendingUploadsContext.Provider>
  );
}

export function usePendingUploadsContext() {
  const context = useContext(PendingUploadsContext);
  if (!context) {
    throw new Error(
      "usePendingUploadsContext must be used within PendingUploadsProvider",
    );
  }
  return context;
}
