"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AdminSidebar } from "./_components/sidebar/AdminSidebar";
import { MobileSidebarContent } from "./_components/sidebar/MobileSidebarComponent";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Auto-close sidebar on mobile when resizing to desktop
  useEffect(() => {
    if (!isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isMobile, isMobileOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden w-64 md:block">
        <AdminSidebar />
      </div>

      <div className="fixed top-0 right-0 left-0 z-40 border-b bg-white shadow-sm md:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
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
          <Button
            aria-label="Toggle menu"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            size="icon"
            variant="ghost"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      <Sheet onOpenChange={setIsMobileOpen} open={isMobileOpen}>
        <SheetContent className="w-64 p-0" side="left">
          <MobileSidebarContent onClose={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="w-full flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
