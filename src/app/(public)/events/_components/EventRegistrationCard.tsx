"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  Check,
  Copy,
  Facebook,
  Linkedin,
  Share2,
  Twitter,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

interface EventRegistrationCardProps {
  event: Event;
}

export default function EventRegistrationCard({
  event,
}: EventRegistrationCardProps) {
  const { eventId } = useParams<{ eventId: string }>();

  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      animate="visible"
      className="lg:col-span-2"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <Card className="sticky top-24 rounded-2xl border-0 bg-card/80 shadow-lg ring-1 ring-border/50 backdrop-blur-xl">
          <CardContent className="rounded-2xl">
            <h3 className="mb-4 font-semibold text-foreground text-lg">
              Registration
            </h3>

            {/* Registration Fee */}
            <div className="flex items-center justify-between border-border border-b py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="h-4 w-4" />
                <span className="text-md">Registration Fee</span>
              </div>
              <span className="font-bold text-lg text-primary">
                {event.registrationFee === 0
                  ? "Free"
                  : Math.trunc(event.registrationFee) > 999999
                    ? "₱999,999+"
                    : `₱${Math.trunc(event.registrationFee).toLocaleString()}`}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Link
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                href={`/registration/${eventId}/info` as Route}
              >
                Register for This Event
              </Link>
            </div>

            {/* Share Section */}
            <div className="mt-6 border-border border-t pt-6">
              <p className="mb-3 flex items-center gap-2 text-muted-foreground text-sm">
                <Share2 className="h-4 w-4" />
                Share this event
              </p>
              <div className="flex gap-2">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Linkedin, label: "LinkedIn" },
                ].map(({ icon: Icon, label }) => (
                  <Button
                    aria-label={`Share on ${label}`}
                    className="flex-1 rounded-lg bg-primary/10 p-2.5 text-primary transition-colors hover:bg-primary/20 hover:text-primary"
                    key={label}
                    size="icon"
                    type="button"
                    variant="default"
                  >
                    <Icon className="mx-auto h-4 w-4" />
                  </Button>
                ))}
                <Button
                  aria-label="Copy link"
                  className="flex-1 rounded-lg bg-primary/10 p-2.5 text-primary transition-colors hover:bg-primary/20 hover:text-primary"
                  onClick={handleCopyLink}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {copied ? (
                    <Check className="mx-auto h-4 w-4" />
                  ) : (
                    <Copy className="mx-auto h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
