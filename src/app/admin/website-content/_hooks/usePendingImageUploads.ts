"use client";

import { useCallback, useRef } from "react";

type UploadFunction = () => Promise<void>;

export function usePendingImageUploads() {
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

  return {
    registerUploadFunction,
    unregisterUploadFunction,
    uploadAllPendingImages,
    hasPendingUploads,
  };
}
