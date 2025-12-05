import type { Metadata } from "next";
import { Anaheim } from "next/font/google";
import "./globals.css?url";
import { Toaster } from "@/components/ui/sonner";

const anaheim = Anaheim({
  variable: "--font-anaheim",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Iloilo Business Club",
  description: "Sustaining the Momentum for Progress since 1990",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={`${anaheim.variable} antialiased`}>
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}
