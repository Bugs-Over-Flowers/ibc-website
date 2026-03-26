import { Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SuccessFooterActions() {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
      <Link className="flex-1" href="/">
        <Button
          className="w-full font-semibold text-foreground/90 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary hover:shadow-sm focus-visible:-translate-y-0.5 focus-visible:bg-primary/10 focus-visible:text-primary"
          size="lg"
          variant="ghost"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
      <Link className="flex-1" href="/membership/check-application-status">
        <Button
          className="w-full font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:bg-primary/90"
          size="lg"
        >
          Check Application Status
        </Button>
      </Link>
    </div>
  );
}
