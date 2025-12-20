import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { SidebarHeaderSkeleton } from "./SidebarHeaderSkeleton";
import { SidebarMenuSkeleton } from "./SidebarMenuSkeleton";
import { SidebarSecondarySkeleton } from "./SidebarSecondarySkeleton";

export function AdminSidebarSkeleton() {
  return (
    <Sidebar
      className="sidebar-custom h-screen border-r bg-white"
      collapsible="icon"
    >
      <SidebarHeaderSkeleton />
      <SidebarContent className="px-3 py-4">
        <SidebarMenuSkeleton />
        <SidebarSecondarySkeleton />
      </SidebarContent>
    </Sidebar>
  );
}
