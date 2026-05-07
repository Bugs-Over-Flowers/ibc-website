import type { Metadata } from "next";
import MembershipSuccessPageClient from "@/app/membership/application/success/_components/MembershipSuccessPageClient";

export const metadata: Metadata = {
  title: "Application Submitted",
  description:
    "Your membership application has been received and is under review.",
};

export default function MembershipSuccessPage() {
  return <MembershipSuccessPageClient />;
}
