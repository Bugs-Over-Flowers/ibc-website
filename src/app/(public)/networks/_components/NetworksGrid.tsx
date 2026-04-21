"use client";

import { motion } from "framer-motion";
import { Building2, MapPin } from "lucide-react";
import Image from "next/image";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";
import { resolveNetworkLogoUrl } from "@/lib/storage/networkLogo";
import { cn } from "@/lib/utils";
import type { Network } from "@/server/networks/types";

interface NetworksGridProps {
  networks: Network[];
}

function RepAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 font-medium text-[10px] text-secondary">
      {initials}
    </div>
  );
}

export function NetworksGrid({ networks }: NetworksGridProps) {
  return (
    <section className="bg-background py-14">
      <motion.div
        animate="visible"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        initial="hidden"
        variants={staggerContainer}
      >
        {networks.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {networks.map((network) => {
              const logoUrl = resolveNetworkLogoUrl(network.logoUrl);

              return (
                <motion.article
                  animate="visible"
                  className={cn(
                    "flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
                    "transition-all duration-200 hover:-translate-y-0.5 hover:border-input",
                  )}
                  initial="hidden"
                  key={network.id}
                  variants={fadeInUp}
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 border-border border-b px-4 py-4">
                    <div className="relative flex aspect-square size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-popover">
                      {logoUrl ? (
                        <Image
                          alt={`${network.organization} logo`}
                          className="object-cover"
                          fill
                          sizes="44px"
                          src={logoUrl}
                        />
                      ) : (
                        <Building2 className="size-4 text-muted" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <h3 className="line-clamp-2 font-medium text-card-foreground text-sm leading-snug">
                        {network.organization}
                      </h3>
                      {/* Location pill — primary color from global.css */}
                      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-ring/30 bg-primary/10 px-2 py-0.5 font-medium text-[11px] text-primary">
                        <MapPin className="size-2.5 shrink-0" />
                        {network.locationType}
                      </span>
                    </div>
                  </div>

                  {/* About */}
                  <div className="flex-1 px-4 py-3">
                    <p className="line-clamp-3 text-muted-foreground text-xs leading-relaxed">
                      {network.about}
                    </p>
                  </div>

                  {/* Representative footer */}
                  <div className="flex items-center gap-2.5 border-border border-t bg-muted/20 px-4 py-3">
                    <RepAvatar name={network.representativeName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-card-foreground text-xs">
                        {network.representativeName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {network.representativePosition}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <motion.div
            animate="visible"
            className="overflow-hidden rounded-2xl border border-border bg-card"
            initial="hidden"
            variants={fadeInUp}
          >
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-popover">
                <Building2 className="size-5 text-muted" />
              </div>
              <div>
                <p className="font-medium text-card-foreground text-sm">
                  No networks found
                </p>
                <p className="mt-1 max-w-xs text-muted-foreground text-xs leading-relaxed">
                  Networks will appear here as organisations and representatives
                  are added.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
