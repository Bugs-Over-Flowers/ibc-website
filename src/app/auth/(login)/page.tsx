import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { LoginForm } from "./_components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your IBC account.",
};

export default function Admin() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Suspense fallback={<Spinner className="size-8" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
