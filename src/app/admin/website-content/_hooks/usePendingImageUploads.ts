"use client";

import { useCallback, useRef } from "react";

type UploadedImageMap = Record<string, string>;
type UploadFunction = () => Promise<UploadedImageMap>;

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
    const results = await Promise.all(uploadPromises);

    return results.reduce<UploadedImageMap>((accumulator, uploadedImages) => {
      Object.assign(accumulator, uploadedImages);
      return accumulator;
    }, {} as UploadedImageMap);
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
