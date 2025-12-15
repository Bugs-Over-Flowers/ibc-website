import { SidebarHeader, SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AdminSidebarHeader() {
  return (
    <SidebarHeader className="border-b px-5 py-4">
      <SidebarMenuButton className={cn("flex h-12 w-full items-center")}>
        <div className="m-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
          <span className="font-semibold text-primary-foreground text-sm">
            A
          </span>
        </div>
        <div className="flex flex-col items-start overflow-hidden">
          <h3 className="truncate font-semibold text-gray-900 text-sm">
            Admin Dashboard
          </h3>
          <p className="truncate text-gray-500 text-xs">Administrator</p>
        </div>
      </SidebarMenuButton>
    </SidebarHeader>
  );
}
