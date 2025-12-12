"use client";

import {
  Calendar,
  FileText,
  LayoutDashboard,
  UserCheck,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { SidebarItem } from "./SidebarItem";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Events",
    icon: Calendar,
    href: "/admin/events",
  },
  {
    title: "Check-in",
    icon: UserCheck,
    href: "/admin/check-in",
  },
  {
    title: "Members",
    icon: Users,
    href: "/admin/members",
  },
  {
    title: "Application",
    icon: FileText,
    href: "/admin/application",
  },
];

export function AdminSidebarMenu() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {menuItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <SidebarItem
              href={item.href}
              icon={item.icon}
              isActive={isActive}
              key={item.title}
              title={item.title}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
