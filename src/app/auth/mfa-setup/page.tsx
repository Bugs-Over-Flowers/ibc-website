import type { Metadata } from "next";
import { MfaSetupForm } from "./_components/forms/MfaSetupForm";

export const metadata: Metadata = {
  title: "Set Up Two-Factor Authentication",
  description: "Secure your account with two-factor authentication.",
};

export default function MfaSetupPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <MfaSetupForm />
    </div>
  );
}
