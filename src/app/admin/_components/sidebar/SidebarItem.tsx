"use client";

import type { LucideIcon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  title: string;
  icon: LucideIcon;
  href: string;
  isActive: boolean;
  variant?: "default" | "destructive";
  onNavigate?: () => void;
}

export function SidebarItem({
  title,
  icon: Icon,
  href,
  isActive,
  variant = "default",
}: SidebarItemProps) {
  const isDestructive = variant === "destructive";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn(
          "h-12 transition-colors",
          isDestructive
            ? "text-red-600 hover:bg-red-50 hover:text-red-700"
            : "hover:bg-gray-100",
          isActive &&
            !isDestructive &&
            "bg-primary/10 text-primary hover:bg-primary/20",
        )}
        isActive={isActive}
      >
        <a
          className="flex items-center gap-3 rounded-md px-3 py-2.5"
          href={href}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              isDestructive
                ? "text-red-600"
                : isActive
                  ? "text-primary"
                  : "text-gray-500",
            )}
          />
          <span className="font-medium">{title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
