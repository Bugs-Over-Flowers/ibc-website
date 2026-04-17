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

  const facebookLink = event.facebookLink?.trim() ?? "";
  const displayFacebookLink = (() => {
    if (!facebookLink) return null;
    const truncate = (value: string) =>
      value.length > 48 ? `${value.slice(0, 45)}...` : value;

    try {
      const url = new URL(facebookLink);
      const path = url.pathname.replace(/\/$/, "");
      const condensed = `${url.hostname}${path}` || url.hostname;
      return truncate(condensed);
    } catch {
      const normalized = facebookLink.replace(/^https?:\/\//i, "");
      return truncate(normalized);
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

              {displayFacebookLink && (
                <a
                  className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-center text-muted-foreground text-sm transition-colors hover:border-primary/30 hover:bg-accent hover:text-foreground"
                  href={facebookLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FacebookIcon className="h-4 w-4 text-[#1877F2]" />
                  <span className="break-all font-medium">
                    {displayFacebookLink}
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
