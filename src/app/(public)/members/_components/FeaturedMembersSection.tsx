import { cookies } from "next/headers";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import tryCatch from "@/lib/server/tryCatch";
import { getFeaturedMembers } from "@/server/members/queries/getFeaturedMembers";

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
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground">
            Featured Members
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Highlighting our distinguished members who are making significant
            contributions to the Iloilo business community.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {featuredMembers.map((member) => (
            <a
              href={member.websiteURL || "#"}
              key={member.businessMemberId}
              rel={member.websiteURL ? "noopener noreferrer" : undefined}
              target={member.websiteURL ? "_blank" : undefined}
            >
              <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <div className="relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted/50 p-2">
                    {member.logoImageURL ? (
                      <Image
                        alt={member.businessName}
                        className="object-contain"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={member.logoImageURL}
                      />
                    ) : (
                      <span className="font-bold text-2xl text-muted-foreground">
                        {member.businessName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="line-clamp-2 font-semibold text-sm group-hover:text-primary">
                    {member.businessName}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-muted-foreground text-xs">
                    {member.Sector?.sectorName}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
