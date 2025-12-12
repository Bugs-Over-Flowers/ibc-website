import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AdminSidebar } from "./_components/sidebar/sidebar";
import "@/app/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administration dashboard",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-50">
          {/* Sidebar - fixed width */}
          <div className="w-64">
            <AdminSidebar />
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
