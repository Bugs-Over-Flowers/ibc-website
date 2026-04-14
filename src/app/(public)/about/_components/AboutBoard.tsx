"use client";

import { User } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

type MemberCard = {
  title: string;
  subtitle: string;
  group: string | null;
  imageUrl?: string;
};

type BoardGroup = "featured" | "officers" | "trustees" | "other";

const boardOfTrustees: MemberCard[] = [
  {
    title: "Juan Jose Jamora III",
    subtitle: "Chairman Emeritus",
    group: "featured",
  },
  { title: "Ma. Luisa Segovia", subtitle: "President", group: "featured" },
  { title: "Herminio Maravilla", subtitle: "Chairman", group: "officers" },
  {
    title: "Jose Paolo Treñas",
    subtitle: "Vice President",
    group: "officers",
  },
  {
    title: "Allen Son Tan",
    subtitle: "Corporate Secretary",
    group: "officers",
  },
  { title: "Phillipp Chua", subtitle: "Treasurer", group: "officers" },
  {
    title: "Atty. George Que",
    subtitle: "Legal Counsel",
    group: "officers",
  },
  { title: "Francis De la Cruz", subtitle: "Trustee", group: "trustees" },
  { title: "Jose Hautea, Jr.", subtitle: "Trustee", group: "trustees" },
  {
    title: "Philip Joel Lataquin",
    subtitle: "Trustee",
    group: "trustees",
  },
  { title: "Jose Layson, Jr.", subtitle: "Trustee", group: "trustees" },
  { title: "Arsenio Rafael III", subtitle: "Trustee", group: "trustees" },
  {
    title: "Atty. Fritzie Diez-Treñas",
    subtitle: "Trustee",
    group: "trustees",
  },
  {
    title: "Engr. Terence Uygongco",
    subtitle: "Trustee",
    group: "trustees",
  },
  { title: "Anatole Dan Viray", subtitle: "Trustee", group: "trustees" },
];

const secretariat: MemberCard[] = [
  {
    title: "Herminia Ore",
    subtitle: "Finance, Marketing, and Promotion",
    group: null,
  },
  {
    title: "Clea Angela Drilon",
    subtitle: "Administrative Officer",
    group: null,
  },
  { title: "Joel Germino", subtitle: "General Services", group: null },
];

interface AboutBoardProps {
  boardCards?: MemberCard[];
  secretariatCards?: MemberCard[];
}

export function AboutBoard({ boardCards, secretariatCards }: AboutBoardProps) {
  const resolvedBoardCards =
    boardCards && boardCards.length > 0 ? boardCards : boardOfTrustees;

  const resolveBoardGroup = (member: MemberCard, index: number): BoardGroup => {
    const normalized = member.group?.trim().toLowerCase();

    if (normalized === "featured") {
      return "featured";
    }
    if (normalized === "officer" || normalized === "officers") {
      return "officers";
    }
    if (normalized === "trustee" || normalized === "trustees") {
      return "trustees";
    }
    if (normalized === "other" || normalized === "others") {
      return "other";
    }

    if (member.subtitle.trim().toLowerCase().includes("trustee")) {
      return "trustees";
    }

    // Fallback to legacy board ordering when group metadata is missing.
    if (index <= 1) {
      return "featured";
    }
    if (index <= 6) {
      return "officers";
    }
    return "trustees";
  };

  const featuredBoardCards = resolvedBoardCards.filter(
    (member, index) => resolveBoardGroup(member, index) === "featured",
  );
  const officerBoardCards = resolvedBoardCards.filter(
    (member, index) => resolveBoardGroup(member, index) === "officers",
  );
  const trusteeBoardCards = resolvedBoardCards.filter(
    (member, index) => resolveBoardGroup(member, index) === "trustees",
  );
  const otherBoardCards = resolvedBoardCards.filter(
    (member, index) => resolveBoardGroup(member, index) === "other",
  );

  const resolvedSecretariatCards =
    secretariatCards && secretariatCards.length > 0
      ? secretariatCards
      : secretariat;

  return (
    <>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <span className="mb-4 inline-block rounded-lg bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm">
              Leadership
            </span>
            <h2 className="mb-4 text-balance font-bold text-3xl text-foreground sm:text-4xl">
              Board of Trustees
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Meet the dedicated leaders who guide the strategic direction of
              the Iloilo Business Club
            </p>
          </motion.div>

          {/* Featured Board Members (Chairman Emeritus, President) */}
          <div className="mb-10 flex flex-wrap justify-center gap-8">
            {featuredBoardCards.map((member, index) => (
              <motion.div
                className="flex h-[340px] w-[260px] flex-col items-center justify-center rounded-3xl bg-card/95 p-8 text-center shadow-xl ring-1 ring-border/50 backdrop-blur-xl"
                initial={{ opacity: 0, y: 20 }}
                key={member.title}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  {member.imageUrl ? (
                    <Image
                      alt={member.title}
                      className="h-24 w-24 rounded-full object-cover"
                      height={96}
                      src={member.imageUrl}
                      unoptimized
                      width={96}
                    />
                  ) : (
                    <User className="h-16 w-16 text-primary/40" />
                  )}
                </div>
                <h3 className="mb-2 font-bold text-foreground text-lg">
                  {member.title}
                </h3>
                <p className="font-medium text-base text-primary">
                  {member.subtitle}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Officers: Chairman, Vice President, Corporate Secretary, Treasurer, Legal Counsel */}
          <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {officerBoardCards.map((member, index) => (
              <motion.div
                className="group mx-auto flex h-[300px] w-[220px] flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                key={member.title}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  {member.imageUrl ? (
                    <Image
                      alt={member.title}
                      className="h-20 w-20 rounded-full object-cover"
                      height={80}
                      src={member.imageUrl}
                      unoptimized
                      width={80}
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary/30" />
                  )}
                </div>
                <h3 className="mb-2 font-semibold text-base text-foreground">
                  {member.title}
                </h3>
                <p className="text-primary text-xs">{member.subtitle}</p>
              </motion.div>
            ))}
          </div>

          {/* Trustees: 8, 4 columns, 2 rows */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {[...trusteeBoardCards, ...otherBoardCards].map((member, index) => (
              <motion.div
                className="group mx-auto flex h-[300px] w-[220px] flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                key={member.title}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  {member.imageUrl ? (
                    <Image
                      alt={member.title}
                      className="h-20 w-20 rounded-full object-cover"
                      height={80}
                      src={member.imageUrl}
                      unoptimized
                      width={80}
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary/30" />
                  )}
                </div>
                <h3 className="mb-2 font-semibold text-base text-foreground">
                  {member.title}
                </h3>
                <p className="text-primary text-xs">{member.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <span className="mb-4 inline-block rounded-lg bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm">
              Our Team
            </span>
            <h2 className="mb-4 text-balance font-bold text-3xl text-foreground sm:text-4xl">
              Secretariat
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              The dedicated team that keeps IBC running smoothly
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
            {resolvedSecretariatCards.map((member, index) => (
              <motion.div
                className="group overflow-hidden rounded-xl border border-border bg-background"
                initial={{ opacity: 0, y: 20 }}
                key={member.title}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="relative aspect-square overflow-hidden">
                  {member.imageUrl ? (
                    <Image
                      alt={member.title}
                      className="h-full w-full object-cover"
                      fill
                      src={member.imageUrl}
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/5">
                      <User className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-semibold text-foreground">
                    {member.title}
                  </h3>
                  <p className="text-primary text-sm">{member.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
