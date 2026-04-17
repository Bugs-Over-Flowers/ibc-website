import { cookies } from "next/headers";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import tryCatch from "@/lib/server/tryCatch";
import { resolveMemberLogoUrl } from "@/lib/storage/memberLogo";
import { getFeaturedMembers } from "@/server/members/queries/getFeaturedMembers";

function normalizeWebsiteUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function toSafeImageSrc(src: string | null): string | null {
  if (!src) {
    return null;
  }

  if (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  ) {
    return src;
  }

  return null;
}

export default async function FeaturedMembersSection() {
  const cookieStore = (await cookies()).getAll();

  const { data: featuredMembers, error } = await tryCatch(
    getFeaturedMembers(cookieStore),
  );

  if (error || !featuredMembers || featuredMembers.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground sm:text-4xl">
            Featured Members
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-sm sm:text-base">
            Meet outstanding IBC members and visit their official websites.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {featuredMembers.map((member) => {
            const normalizedWebsiteURL = normalizeWebsiteUrl(member.websiteURL);
            const resolvedLogoURL = toSafeImageSrc(
              resolveMemberLogoUrl(member.logoImageURL),
            );

            const logo = (
              <div className="relative mb-5 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-muted/50 p-3">
                {resolvedLogoURL ? (
                  <Image
                    alt={member.businessName}
                    className="object-contain"
                    fill
                    sizes="128px"
                    src={resolvedLogoURL}
                  />
                ) : (
                  <span className="font-bold text-3xl text-muted-foreground">
                    {member.businessName.charAt(0)}
                  </span>
                )}
              </div>
            );

            return (
              <Card
                className="group h-full min-h-[280px] w-[280px] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                key={member.businessMemberId}
              >
                <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
                  {normalizedWebsiteURL ? (
                    <a
                      aria-label={`Visit ${member.businessName} website`}
                      href={normalizedWebsiteURL}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {logo}
                    </a>
                  ) : (
                    logo
                  )}

                  <h3 className="line-clamp-2 font-semibold text-base group-hover:text-primary">
                    {member.businessName}
                  </h3>
                  <p className="mt-2 line-clamp-1 text-muted-foreground text-sm">
                    {member.Sector?.sectorName}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
