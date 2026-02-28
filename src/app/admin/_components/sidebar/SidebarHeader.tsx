"use client";

import { useAuthUser } from "@/app/admin/_hooks/useAuthUser";
import { ModeToggle } from "@/components/NightModeToggle";
import { SidebarHeader, SidebarMenuButton } from "@/components/ui/sidebar";

export function AdminSidebarHeader() {
  const { email } = useAuthUser();

  return (
    <SidebarHeader className="border-b px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <SidebarMenuButton className="flex h-12 flex-1 items-center">
          <div className="m-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
            <span className="font-semibold text-primary-foreground text-sm">
              {email ? email.charAt(0).toUpperCase() : "A"}
            </span>
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <h3 className="truncate font-semibold text-sm">IBC Admin</h3>
            <p className="max-w-full truncate text-gray-500 text-xs">
              {email ?? "Administrator"}
            </p>
          </div>
        </SidebarMenuButton>
        <ModeToggle />
      </div>
    </SidebarHeader>
  );
}
