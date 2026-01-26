"use client";

import Image from "next/image";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "@/hooks/useAction";
import { enrollMfa, verifyMfa } from "@/server/auth/actions/mfa";

export function MfaSetupForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [mounted, setMounted] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const { execute: executeEnroll, isPending: isEnrolling } = useAction(
    enrollMfa,
    {
      onSuccess: (data) => {
        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
      },
      onError: (error) => {
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
    },
  );

  const { execute: executeVerify, isPending: isVerifying } = useAction(
    verifyMfa,
    {
      onSuccess: () => {
        setCode("");
        toast.success("MFA enabled successfully");
        router.push("/admin");
      },
      onError: (error) => {
        setCode("");
        const errorMessage = error instanceof Error ? error.message : error;
        toast.error(errorMessage);
      },
    },
  );

  const hasEnrolled = useRef(false);

  useEffect(() => {
    if (!hasEnrolled.current) {
      hasEnrolled.current = true;
      executeEnroll(undefined);
    }
  }, [executeEnroll]);

  useEffect(() => {
    // Focus the OTP input when QR code is loaded
    if (qrCode) {
      setMounted(true);
      setCode("");
      const timer = setTimeout(() => {
        otpRef.current?.focus();
      }, 300);
      return () => {
        clearTimeout(timer);
        setMounted(false);
      };
    }
  }, [qrCode]);

  const handleVerify = () => {
    if (!factorId || !code) return;
    executeVerify({ factorId, code });
  };

  if (isEnrolling && !qrCode) {
    return (
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle>Setup Multi-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="size-48" />
          </div>
          <div className="space-y-2">
            <Skeleton className="mx-auto h-4 w-28" />
            <div className="flex justify-center gap-2">
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="size-12 rounded-md" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader>
        <CardTitle>Setup Multi-Factor Authentication</CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCode && (
          <div className="flex justify-center">
            <Image
              alt="MFA QR Code"
              className="size-48"
              height={192}
              src={qrCode.trimEnd()}
              width={192}
            />
          </div>
        )}
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
              <InputOTPGroup className="gap-1 sm:gap-2">
                <InputOTPSlot
                  className="size-10 rounded-md border font-semibold text-base sm:size-12 sm:text-lg"
                  index={0}
                />
                <InputOTPSlot
                  className="size-10 rounded-md border font-semibold text-base sm:size-12 sm:text-lg"
                  index={1}
                />
                <InputOTPSlot
                  className="size-10 rounded-md border font-semibold text-base sm:size-12 sm:text-lg"
                  index={2}
                />
                <InputOTPSlot
                  className="size-10 rounded-md border font-semibold text-base sm:size-12 sm:text-lg"
                  index={3}
                />
                <InputOTPSlot
                  className="size-10 rounded-md border font-semibold text-base sm:size-12 sm:text-lg"
                  index={4}
                />
                <InputOTPSlot
                  className="size-10 rounded-md border font-semibold text-base sm:size-12 sm:text-lg"
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
          disabled={isVerifying || !code || !factorId}
          onClick={handleVerify}
        >
          {isVerifying ? (
            <>
              <Spinner className="size-4" />
              Verifying...
            </>
          ) : (
            "Verify and Enable"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
