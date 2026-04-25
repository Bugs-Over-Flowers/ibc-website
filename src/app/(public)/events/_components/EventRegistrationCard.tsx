"use client";

import { motion } from "framer-motion";
import { Banknote, ExternalLink } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FacebookIcon } from "@/components/icons/SocialIcons";
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
  const safeFacebookLink = (() => {
    const rawLink = event.facebookLink?.trim();
    if (!rawLink) {
      return null;
    }

    try {
      const parsed = new URL(rawLink);
      const isHttpProtocol =
        parsed.protocol === "https:" || parsed.protocol === "http:";
      if (!isHttpProtocol) {
        return null;
      }

      return parsed.toString();
    } catch {
      return null;
    }
  })();

  return (
    <motion.div
      animate="visible"
      className="lg:col-span-2"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp}>
        <Card className="rounded-2xl border-0 bg-card/80 py-0 shadow-lg ring-1 ring-border/50 backdrop-blur-xl lg:sticky lg:top-24">
          <CardContent className="rounded-2xl p-4 sm:p-6">
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

              {safeFacebookLink && (
                <a
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-foreground transition-colors hover:border-primary/30 hover:bg-accent"
                  href={safeFacebookLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FacebookIcon className="h-5 w-5 text-[#1877F2]" />
                  <span className="flex-1 font-medium">
                    Event Facebook Link
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
