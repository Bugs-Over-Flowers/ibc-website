import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

const menuItemKeys = [
  "dashboard",
  "events",
  "check-in",
  "members",
  "application",
];

export function SidebarMenuSkeleton() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {menuItemKeys.map((key) => (
          <SidebarMenuItem key={key}>
            <SidebarMenuButton className="h-12 w-full justify-start">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="ml-3 h-4 w-24" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
