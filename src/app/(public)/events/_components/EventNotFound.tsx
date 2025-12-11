"use client";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";
import { Button } from "@/components/ui/button";

export function EventNotFound() {
  return (
    <main className="min-h-screen bg-background">
      <Header onNavigate={() => {}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <Link href="/events">
          <Button
            variant="outline"
            className="gap-2 mb-8 bg-white/70 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Button>
        </Link>
        <div className="text-center py-12">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-12 shadow-lg ring-1 ring-white/50 max-w-md mx-auto">
            <Calendar className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#2E2A6E] mb-2">
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
