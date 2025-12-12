"use client";

import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { SidebarItem } from "./SidebarItem";

const secondaryItems = [
  //   {
  //     title: "Settings",
  //     icon: Settings,
  //     href: "/admin/settings",
  //   },
  {
    title: "Logout",
    icon: LogOut,
    href: "/auth",
    variant: "destructive" as const,
  },
];

export function AdminSidebarSecondary() {
  const pathname = usePathname();

  return (
    <SidebarGroup className="mt-auto border-t pt-4">
      <SidebarMenu>
        {secondaryItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <SidebarItem
              href={item.href}
              icon={item.icon}
              isActive={isActive}
              key={item.title}
              title={item.title}
              variant={item.variant}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
