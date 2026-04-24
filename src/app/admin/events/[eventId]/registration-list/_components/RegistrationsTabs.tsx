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
      <TabsList className="h-9 gap-1 rounded-lg bg-muted p-1">
        <TabsTrigger
          className="rounded-md px-4 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
          value="registrations"
        >
          Registrations
        </TabsTrigger>
        <TabsTrigger
          className="rounded-md px-4 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
          value="participants"
        >
          Participants
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
