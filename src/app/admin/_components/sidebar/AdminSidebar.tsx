"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AdminSidebarHeader } from "./SidebarHeader";
import { AdminSidebarMenu } from "./SidebarMenu";
import { AdminSidebarSecondary } from "./SidebarSecondary";

export function AdminSidebar() {
  return (
    <SidebarProvider>
      <Sidebar className="h-screen border-r bg-white">
        <AdminSidebarHeader />
        <SidebarContent className="px-3 py-4">
          <AdminSidebarMenu />
          <AdminSidebarSecondary />
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
