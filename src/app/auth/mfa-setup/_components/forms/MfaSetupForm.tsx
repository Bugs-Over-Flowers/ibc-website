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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "@/hooks/useAction";
import { enrollMfa, verifyMfa } from "@/server/auth/mutations/mfa";

export function MfaSetupForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

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
        toast.success("MFA enabled successfully");
        router.push("/admin/dashboard");
      },
      onError: (error) => {
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

  const handleVerify = () => {
    if (!factorId || !code) return;
    executeVerify({ factorId, code });
  };

  if (isEnrolling && !qrCode) {
    return (
      <div className="flex justify-center p-8">
        <Spinner className="size-8" />
      </div>
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
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            maxLength={6}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            value={code}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={isVerifying || !code || !factorId}
          onClick={handleVerify}
        >
          {isVerifying ? "Verifying..." : "Verify and Enable"}
        </Button>
      </CardFooter>
    </Card>
  );
}
