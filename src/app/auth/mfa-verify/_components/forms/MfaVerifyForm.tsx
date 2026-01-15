"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "@/hooks/useAction";
import { loginVerifyMfa } from "@/server/auth/mutations/mfa";

export function MfaVerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [mounted, setMounted] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Force remount on navigation
    setMounted(true);
    setCode("");
    const timer = setTimeout(() => {
      otpRef.current?.focus();
    }, 300);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  const { execute, isPending } = useAction(loginVerifyMfa, {
    onSuccess: () => {
      setCode("");
      toast.success("Logged in successfully");
      router.push("/admin/dashboard");
    },
    onError: (error) => {
      setCode("");
      const errorMessage = error instanceof Error ? error.message : error;
      toast.error(errorMessage);
      if (
        errorMessage.includes("Bearer token") ||
        errorMessage.includes("not logged in") ||
        errorMessage.includes("User from sub claim in JWT does not exist")
      ) {
        router.push("/auth");
      }
    },
  });

  const handleVerify = () => {
    if (!code) return;
    execute(code);
  };

  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="block text-center" htmlFor="code">
            Verification Code
          </Label>
          {mounted && (
            <InputOTP
              id="code"
              maxLength={6}
              onChange={(value) => setCode(value)}
              onComplete={handleVerify}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerify();
              }}
              ref={otpRef}
              value={code}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  className="h-12 w-12 rounded-md border font-semibold text-lg"
                  index={0}
                />
                <InputOTPSlot
                  className="h-12 w-12 rounded-md border font-semibold text-lg"
                  index={1}
                />
                <InputOTPSlot
                  className="h-12 w-12 rounded-md border font-semibold text-lg"
                  index={2}
                />
                <InputOTPSlot
                  className="h-12 w-12 rounded-md border font-semibold text-lg"
                  index={3}
                />
                <InputOTPSlot
                  className="h-12 w-12 rounded-md border font-semibold text-lg"
                  index={4}
                />
                <InputOTPSlot
                  className="h-12 w-12 rounded-md border font-semibold text-lg"
                  index={5}
                />
              </InputOTPGroup>
            </InputOTP>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={isPending || !code}
          onClick={handleVerify}
        >
          {isPending ? (
            <>
              <Spinner className="size-4" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
