"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { AdminSidebarHeader } from "./SidebarHeader";
import { AdminSidebarMenu } from "./SidebarMenu";
import { AdminSidebarSecondary } from "./SidebarSecondary";

export function AdminSidebar() {
  return (
    <Sidebar
      className="sidebar-custom h-screen border-r bg-white"
      collapsible="icon"
    >
      <AdminSidebarHeader />
      <SidebarContent className="px-3 py-4">
        <AdminSidebarMenu />
        <AdminSidebarSecondary />
      </SidebarContent>
    </Sidebar>
  );
}
