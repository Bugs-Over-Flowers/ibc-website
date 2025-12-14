"use client";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <Link href="/events">
          <Button
            className="mb-8 gap-2 bg-white/70 backdrop-blur-sm"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <div className="py-12 text-center">
          <div className="mx-auto max-w-md rounded-2xl bg-white/60 p-12 shadow-lg ring-1 ring-white/50 backdrop-blur-xl">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-foreground/30" />
            <h3 className="mb-2 font-bold text-[#2E2A6E] text-xl">
              Event Not Found
            </h3>
            <p className="text-foreground/60">
              The event you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
