import { SidebarHeader } from "@/components/ui/sidebar";

export function AdminSidebarHeader() {
  return (
    <SidebarHeader className="border-b px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-16 items-center justify-center rounded-full bg-primary">
          <span className="font-semibold text-primary-foreground text-sm">
            A
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
          <p className="text-gray-500 text-xs">Administrator</p>
        </div>
      </div>
    </SidebarHeader>
  );
}
