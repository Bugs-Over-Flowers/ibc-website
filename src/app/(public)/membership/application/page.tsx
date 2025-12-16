import { Suspense } from "react";
import { MembershipApplicationForm } from "./_components/MembershipApplicationForm";

export default function MembershipApplicationPage() {
  return (
    <div className="container mx-auto py-25">
      <Suspense>
        <MembershipApplicationForm />
      </Suspense>
    </div>
  );
}
