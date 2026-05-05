import { Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createActionClient } from "@/lib/supabase/server";
import { AdminSidebar } from "./_components/sidebar/AdminSidebar";
import { MobileHeader } from "./_components/sidebar/MobileHeader";
import { AdminSidebarSkeleton } from "./_components/sidebar/Skeleton/AdminSidebarSkeleton";
import { MobileHeaderSkeleton } from "./_components/sidebar/Skeleton/MobileHeaderSkeleton";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? null;

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div
          className="flex min-h-screen w-full bg-background"
          suppressHydrationWarning
        >
          <Suspense fallback={<AdminSidebarSkeleton />}>
            <AdminSidebar email={email} />
          </Suspense>

          <main className="flex-1 overflow-auto">
            <Suspense fallback={<MobileHeaderSkeleton />}>
              <MobileHeader />
            </Suspense>
            <div className="h-full w-full p-4 md:p-6">{children}</div>
          </main>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
