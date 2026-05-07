"use client";

import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { AdminSidebarHeader } from "./SidebarHeader";
import { AdminSidebarMenu } from "./SidebarMenu";
import { AdminSidebarSecondary } from "./SidebarSecondary";

type AdminSidebarProps = {
  email: string | null;
};

export function AdminSidebar({ email }: AdminSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="sidebar-custom h-screen select-none border-r bg-white">
      <AdminSidebarHeader email={email} />
      <SidebarContent className="px-3 py-4">
        <AdminSidebarMenu onNavigate={handleNavigate} />
        <AdminSidebarSecondary onNavigate={handleNavigate} />
      </SidebarContent>
    </Sidebar>
  );
}
