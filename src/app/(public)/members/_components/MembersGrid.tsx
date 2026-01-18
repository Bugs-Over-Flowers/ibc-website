import { Img } from "@react-email/components";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp } from "@/lib/animations/fade";
import { staggerContainer } from "@/lib/animations/stagger";
import type { Member } from "./MembersList";

interface MembersGridProps {
  members: Member[];
}

export function MembersGrid({ members }: MembersGridProps) {
  return (
    <section className="bg-muted/50 py-16">
      <motion.div
        animate="visible"
        className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8"
        initial="hidden"
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, idx) => {
            const safeKey =
              member.id !== undefined &&
              member.id !== null &&
              (typeof member.id !== "string" || member.id !== "") &&
              (typeof member.id !== "number" || !Number.isNaN(member.id))
                ? member.id
                : `member-${idx}`;
            const cardContent = (
              <CardContent className="flex h-full flex-col p-0" key={safeKey}>
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-linear-to-br from-secondary to-accent">
                  <div className="absolute inset-0"></div>
                  {member.logoImageURL ? (
                    <Img
                      alt={member.businessName}
                      className="aspect-square h-full w-full bg-white object-cover p-4 transition-transform duration-500 group-hover:scale-105"
                      src={member.logoImageURL}
                      style={{ aspectRatio: "1 / 1", objectPosition: "center" }}
                    />
                  ) : (
                    <div
                      className="flex aspect-square h-full w-full items-center justify-center"
                      style={{ aspectRatio: "1 / 1" }}
                    >
                      <Building2 className="h-20 w-20 text-primary/30" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-1 p-4">
                  <div className="flex h-full items-center justify-center">
                    <h3 className="text-center font-bold text-foreground text-lg">
                      {member.businessName}
                    </h3>
                  </div>
                  {member.sector && (
                    <div>
                      <p className="text-center text-muted-foreground text-xs">
                        {member.sector}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            );
            return (
              <motion.div
                key={safeKey}
                variants={fadeInUp}
                whileHover={{
                  scale: 1.03,
                  y: -4,
                  boxShadow: "0 8px 32px 0 rgba(34, 60, 80, 0.12)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                {member.websiteURL ? (
                  <a
                    className="block h-full"
                    href={member.websiteURL}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Card className="flex h-full min-h-[400px] flex-col overflow-hidden p-0 transition-shadow hover:shadow-lg">
                      {cardContent}
                    </Card>
                  </a>
                ) : (
                  <Card className="flex h-full min-h-[400px] flex-col overflow-hidden p-0 transition-shadow">
                    {cardContent}
                  </Card>
                )}
              </motion.div>
            );
          })}
        </div>
        {members.length === 0 && (
          <motion.div className="py-12 text-center" variants={fadeInUp}>
            <p className="text-muted-foreground">
              No members found in this sector.
            </p>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
