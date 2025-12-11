"use client";

import {
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    title: "Logout",
    icon: LogOut,
    href: "/logout",
    variant: "destructive" as const,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar className="border-r bg-white h-screen">
        <SidebarHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex w-16 h-12 items-center rounded-full justify-center bg-primary">
              <span className="text-sm font-semibold text-primary-foreground">
                A
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "transition-colors hover:bg-gray-100 h-12",
                        isActive &&
                          "bg-primary/10 text-primary hover:bg-primary/20",
                      )}
                    >
                      <a
                        href={item.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5"
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isActive ? "text-primary" : "text-gray-500",
                          )}
                        />
                        <span className="font-medium">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="mt-auto pt-4 border-t">
            <SidebarMenu>
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isDestructive = item.variant === "destructive";

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "transition-colors",
                        isDestructive
                          ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                          : "hover:bg-gray-100",
                        isActive &&
                          !isDestructive &&
                          "bg-primary/10 text-primary hover:bg-primary/20",
                      )}
                    >
                      <a
                        href={item.href}
                        className="flex items-center gap-3 rounded-md px-3 py-2.5"
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
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
