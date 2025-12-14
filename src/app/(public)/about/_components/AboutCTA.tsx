"use client";
import { motion } from "framer-motion";
import { Handshake } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutCTA() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#2E2A6E] via-[#2E2A6E] to-[#1a1745] py-20 text-white">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-white/5 blur-[100px]" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[150px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl">
              <Handshake className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mb-4 font-bold text-4xl md:text-5xl">
            Join Our Community
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-white/80 text-xl">
            Become part of Iloilo&apos;s leading business network and help shape
            the future of our region
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="bg-white text-[#2E2A6E] shadow-xl transition-all hover:bg-white/90 hover:shadow-2xl"
              size="lg"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button
              asChild
              className="border-2 border-white/50 bg-transparent text-white backdrop-blur-sm hover:bg-white/10"
              size="lg"
              variant="outline"
            >
              <Link href="/events">View Events</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
