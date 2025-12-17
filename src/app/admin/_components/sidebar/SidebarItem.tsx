"use client";

import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  title: string;
  icon: LucideIcon;
  href: string;
  isActive: boolean;
  variant?: "default" | "destructive";
  onNavigate?: () => void;
  collapsed?: boolean;
}

export function SidebarItem({
  title,
  icon: Icon,
  href,
  isActive,
  variant = "default",
  onNavigate,
}: SidebarItemProps) {
  const router = useRouter();
  const isDestructive = variant === "destructive";

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
    router.push(href as Route);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={cn(
          "h-12 w-full justify-start transition-colors transition-padding",
          isDestructive
            ? "text-red-600 hover:bg-red-50 hover:text-red-700"
            : "hover:bg-gray-100",
          isActive &&
            !isDestructive &&
            "bg-primary/10 text-primary hover:bg-primary/20",
        )}
        isActive={isActive}
        onClick={handleClick}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            isDestructive
              ? "text-red-600"
              : isActive
                ? "text-muted-background"
                : "text-primary",
          )}
        />
        <span className="font-medium">{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
