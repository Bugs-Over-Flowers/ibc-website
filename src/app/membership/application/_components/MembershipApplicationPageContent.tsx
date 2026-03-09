import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSectors } from "@/server/membership/queries/getSectors";
import { MembershipApplicationFormWrapper } from "./MembershipApplicationFormWrapper";

export async function MembershipApplicationPageContent() {
  const cookieStore = await cookies();
  const sectors = await getSectors(cookieStore.getAll());

  return (
    <div>
      <div className="bg-primary px-4 pt-8 pb-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link href="/">
              <Button className="text-primary-foreground" variant="ghost">
                <ChevronLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <h1 className="mb-4 font-extrabold text-4xl text-primary-foreground tracking-tight md:text-5xl">
            Membership Application
          </h1>
          <p className="max-w-2xl font-medium text-lg text-primary-foreground/90 leading-relaxed">
            Join the Iloilo Business Club and connect with the region&apos;s top
            enterprises and leaders.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <MembershipApplicationFormWrapper sectors={sectors} />
      </div>
    </div>
  );
}
