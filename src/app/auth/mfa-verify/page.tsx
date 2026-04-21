import type { Metadata } from "next";
import { MfaVerifyForm } from "./_components/forms/MfaVerifyForm";

export const metadata: Metadata = {
  title: "Verify Code",
  description: "Enter your two-factor authentication code.",
};

export default function MfaVerifyPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <MfaVerifyForm />
    </div>
  );
}
