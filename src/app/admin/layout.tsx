import { Suspense } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/sidebar/AdminSidebar";
import { MobileHeader } from "./_components/sidebar/MobileHeader";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Suspense>
          <AdminSidebar />
        </Suspense>

        <main className="flex-1 overflow-auto">
          <MobileHeader />
          <div className="p-4 md:p-6">
            <div className="mb-4 hidden md:block">
              <SidebarTrigger />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
