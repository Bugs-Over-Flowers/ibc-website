import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { SignUpForm } from "./SignUp";

export default function Admin() {
  return (
    <div className="flex justify-center items-center h-screen w-full p-4">
      <Suspense fallback={<Spinner className="size-8" />}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
