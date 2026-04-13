import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MembershipGuidelinesProps {
  className?: string;
  collapsible?: boolean;
  compact?: boolean;
}

export function MembershipGuidelines({
  className,
  collapsible = false,
  compact = false,
}: MembershipGuidelinesProps) {
  const list = (
    <ul
      className={cn(
        "list-disc space-y-2 pl-5 text-muted-foreground leading-relaxed",
        compact ? "text-xs sm:text-sm" : "text-sm",
      )}
    >
      <li>
        All new or renewed memberships shall be dated on the first day of the
        month, during which the membership fee was paid.
      </li>
      <li>
        Memberships will be strictly by invitation. However, a person may be
        proposed for membership by any member, subject to the endorsement of the
        Membership Committee and approval of the Board of Trustees.
      </li>
      <li>
        Membership to the Club shall cease upon resignation or death of personal
        member. Corporate members may request for change of representation in
        case of re-assignment or death of primary member.
      </li>
      <li>
        No refund to dues and membership fee shall be given in the event that
        the membership was terminated prior to the next anniversary date of the
        membership.
      </li>
      <li>
        In connection with this membership with Iloilo Business Club and
        pursuant to the requirements of Republic Act No. 10173, otherwise known
        as the{" "}
        <a
          className="text-primary underline underline-offset-2 hover:text-primary/80"
          href="https://privacy.gov.ph/data-privacy-act/#w39"
          rel="noopener noreferrer"
          target="_blank"
        >
          Data Privacy Act of 2012 and its Implementing Rules and Regulations
          ("Act")
        </a>
        , you hereby give your consent and unequivocally: (1) Agree in the
        collection, storage, organization, process, erasure or destruction of
        your personal information, by Iloilo Business Club, Inc., for purposes
        of updating your membership records, as well as to be used as reference
        for future events, within two years from the date of your submission.
        (2) Affirm all your rights under the Act, including your right to
        access, rectify and withdraw the information you have provided. (3)
        Allow Iloilo Business Club, Inc. to collect, store, organize, process,
        erase and destruct your personal information in a manner which it think
        is best to protect its confidentiality.
      </li>
    </ul>
  );

  if (collapsible) {
    return (
      <details
        className={cn(
          "rounded-xl border border-primary/20 bg-background/30 text-left",
          className,
        )}
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium text-primary text-sm">
          <Info className="h-4 w-4" />
          General Guidelines and Terms of Membership
        </summary>
        <div className="border-primary/15 border-t px-4 py-3">{list}</div>
      </details>
    );
  }

  return (
    <div className={cn("space-y-4 rounded-xl border-0 p-0", className)}>
      <div className="flex items-center gap-2 font-bold text-primary">
        <Info className="h-5 w-5" />
        <span className="font-medium text-lg">
          General Guidelines and Terms of Membership
        </span>
      </div>
      {list}
    </div>
  );
}
