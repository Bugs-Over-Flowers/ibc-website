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
import { useState } from "react";
import { fadeInUp } from "@/components/animations/fade";
import { staggerContainer } from "@/components/animations/stagger";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/db.types";

type Event = Tables<"Event">;

interface EventRegistrationCardProps {
  event: Event;
}

export default function EventRegistrationCard({
  event,
}: EventRegistrationCardProps) {
  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="lg:col-span-2"
    >
      <motion.div variants={fadeInUp}>
        <Card className="sticky top-24 border-0 bg-card/80 backdrop-blur-xl shadow-lg ring-1 ring-border/50 rounded-2xl">
          <CardContent className="p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Registration
            </h3>

            {/* Registration Fee */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="w-4 h-4" />
                <span className="text-md">Registration Fee</span>
              </div>
              <span className="font-bold text-foreground text-lg">
                {event.registrationFee === 0
                  ? "Free"
                  : `₱${event.registrationFee.toLocaleString()}`}
              </span>
            </div>

            {/* Available Slots */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">Available Slots</span>
              </div>
              <span className="font-medium text-primary">Open</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                size="lg"
                className="w-full bg-primary rounded-2xl hover:bg-primary/90 text-primary-foreground h-12 font-semibold"
              >
                Register for This Event
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-2xl border-border hover:bg-accent h-12 text-foreground bg-transparent"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </div>

            {/* Share Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share this event
              </p>
              <div className="flex gap-2">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Linkedin, label: "LinkedIn" },
                ].map(({ icon: Icon, label }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-1 p-2.5 bg-muted hover:bg-accent rounded-lg transition-colors"
                    aria-label={`Share on ${label}`}
                  >
                    <Icon className="w-4 h-4 text-foreground mx-auto" />
                  </Button>
                ))}
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  variant="ghost"
                  size="icon"
                  className="flex-1 p-2.5 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                  aria-label="Copy link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary mx-auto" />
                  ) : (
                    <Copy className="w-4 h-4 text-primary mx-auto" />
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
