"use client";

import {
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MobileSidebarContentProps {
  onClose: () => void;
}

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

const secondaryItems = [
  {
    title: "Logout",
    icon: LogOut,
    href: "/auth",
    variant: "destructive" as const,
  },
];

export function MobileSidebarContent({ onClose }: MobileSidebarContentProps) {
  const pathname = usePathname();

  const handleNavigation = () => {
    onClose();
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <span className="font-semibold text-primary-foreground text-sm">
              A
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
            <p className="text-gray-500 text-xs">Administrator</p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-auto px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "hover:bg-gray-100",
                )}
                href={{
                  pathname: item.href,
                }}
                key={item.title}
                onClick={handleNavigation}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : "text-gray-500",
                  )}
                />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Secondary Menu */}
      <div className="border-t px-3 py-4">
        <nav className="space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isDestructive = item.variant === "destructive";
            const isActive = pathname === item.href;

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                  isDestructive
                    ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                    : isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "hover:bg-gray-100",
                )}
                href={{
                  pathname: item.href,
                }}
                key={item.title}
                onClick={handleNavigation}
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
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
