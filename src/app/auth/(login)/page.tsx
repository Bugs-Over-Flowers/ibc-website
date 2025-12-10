import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { LoginForm } from "./_forms/LoginForm";

export default function Admin() {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Suspense fallback={<Spinner className="size-8" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
