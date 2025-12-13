import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileHeader() {
  return (
    <div className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 shadow-sm md:hidden">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
          <span className="font-semibold text-primary-foreground text-sm">
            A
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            Admin Dashboard
          </h3>
          <p className="text-gray-500 text-xs">Administrator</p>
        </div>
      </div>
      <SidebarTrigger />
    </div>
  );
}
