import { Suspense } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClientOnlyTooltip } from "./_components/ClientOnlyTooltip";
import { AdminSidebar } from "./_components/sidebar/AdminSidebar";
import { MobileHeader } from "./_components/sidebar/MobileHeader";
import { AdminSidebarSkeleton } from "./_components/sidebar/Skeleton/AdminSidebarSkeleton";
import { MobileHeaderSkeleton } from "./_components/sidebar/Skeleton/MobileHeaderSkeleton";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex min-h-screen w-full bg-background">
          <Suspense fallback={<AdminSidebarSkeleton />}>
            <AdminSidebar />
          </Suspense>

          <main className="flex-1 overflow-auto">
            <Suspense fallback={<MobileHeaderSkeleton />}>
              <MobileHeader />
            </Suspense>
            <div className="p-4 md:p-6">
              <div className="mb-4 hidden md:block">
                <ClientOnlyTooltip />
              </div>
              {children}
            </div>
          </main>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
