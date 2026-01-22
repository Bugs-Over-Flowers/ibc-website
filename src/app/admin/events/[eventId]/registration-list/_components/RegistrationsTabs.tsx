"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RegistrationTabsProps {
  children: React.ReactNode;
}

export default function RegistrationTabs({ children }: RegistrationTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") || "registrations";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}` as Route);
  };

  return (
    <Tabs onValueChange={handleTabChange} value={currentTab}>
      <TabsList>
        <TabsTrigger value="registrations">Registrations</TabsTrigger>
        <TabsTrigger value="participants">Participants</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
