"use client";

import { LogOut } from "lucide-react";
import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { SidebarItem } from "./SidebarItem";

const secondaryItems = [
  {
    title: "Logout",
    icon: LogOut,
    href: "/auth",
    variant: "destructive" as const,
  },
];

interface AdminSidebarSecondaryProps {
  onNavigate?: () => void;
}

export function AdminSidebarSecondary({
  onNavigate,
}: AdminSidebarSecondaryProps) {
  return (
    <SidebarGroup className="mt-auto border-t pt-4">
      <SidebarMenu>
        {secondaryItems.map((item) => (
          <SidebarItem
            href={item.href}
            icon={item.icon}
            isActive={false}
            key={item.title}
            onNavigate={onNavigate}
            title={item.title}
            variant={item.variant}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
