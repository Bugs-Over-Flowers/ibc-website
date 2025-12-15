import { SidebarHeader, SidebarMenuButton } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarHeaderSkeleton() {
  return (
    <SidebarHeader className="border-b px-5 py-4">
      <SidebarMenuButton className="flex h-12 w-full items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ml-3 flex flex-col items-start gap-2 overflow-hidden">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </SidebarMenuButton>
    </SidebarHeader>
  );
}
