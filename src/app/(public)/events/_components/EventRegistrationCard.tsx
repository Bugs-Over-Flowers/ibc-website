"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  Check,
  Copy,
  Facebook,
  Linkedin,
  MessageSquare,
  Share2,
  Twitter,
  Users,
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
          <CardContent className="rounded-2xl p-6">
            <h3 className="mb-4 font-semibold text-foreground text-lg">
              Registration
            </h3>

            {/* Registration Fee */}
            <div className="flex items-center justify-between border-border border-b py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="h-4 w-4" />
                <span className="text-md">Registration Fee</span>
              </div>
              <span className="font-bold text-foreground text-lg">
                {event.registrationFee === 0
                  ? "Free"
                  : `₱${event.registrationFee.toLocaleString()}`}
              </span>
            </div>

            {/* Available Slots */}
            <div className="flex items-center justify-between border-border border-b py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">Available Slots</span>
              </div>
              <span className="font-medium text-primary">Open</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Link href={`/registration/${eventId}/info` as Route}>
                <Button
                  className="h-12 w-full rounded-2xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Register for This Event
                </Button>
              </Link>

              <Button
                className="h-12 w-full rounded-2xl border-border bg-transparent text-foreground hover:bg-accent"
                size="lg"
                variant="outline"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
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
                    className="flex-1 rounded-lg bg-muted p-2.5 transition-colors hover:bg-accent"
                    key={label}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Icon className="mx-auto h-4 w-4 text-foreground" />
                  </Button>
                ))}
                <Button
                  aria-label="Copy link"
                  className="flex-1 rounded-lg bg-primary/10 p-2.5 transition-colors hover:bg-primary/20"
                  onClick={handleCopyLink}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {copied ? (
                    <Check className="mx-auto h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="mx-auto h-4 w-4 text-primary" />
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
