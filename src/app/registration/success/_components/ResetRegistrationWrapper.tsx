"use client";
import { useEffect } from "react";
import useRegistrationStore from "@/hooks/registration.store";
export default function ResetRegistrationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const resetStore = useRegistrationStore((state) => state.resetStore);
  useEffect(() => {
    resetStore();
  }, [resetStore]);
  return <>{children}</>;
}
