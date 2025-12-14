import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSecondarySkeleton() {
  return (
    <SidebarGroup className="mt-auto border-t pt-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="h-12 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="ml-3 h-4 w-16" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
