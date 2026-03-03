import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SponsoredRegistrationDisabled() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-bold text-2xl">Invalid Registration Link</h1>
      <p className="max-w-md text-muted-foreground">
        This sponsored registration link is invalid, expired, or the sponsorship
        is no longer active. Please contact the sponsor for a valid link.
      </p>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
