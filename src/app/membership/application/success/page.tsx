import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MembershipSuccessPage() {
  return (
    <div className="container mx-auto flex min-h-[80vh] w-full flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 rounded-full bg-green-100 p-6 text-green-600">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      <h1 className="mb-2 font-bold text-3xl">Application Submitted!</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Thank you for applying for membership at Iloilo Business Club. We have
        received your application and will review it shortly. You will receive
        an email update regarding your application status.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild>
          <Link href="/events">Browse Events</Link>
        </Button>
      </div>
    </div>
  );
}
