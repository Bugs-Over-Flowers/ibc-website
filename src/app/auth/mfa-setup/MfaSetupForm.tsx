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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "@/hooks/useAction";
import { enrollMfa, verifyMfa } from "@/lib/server/mfa";

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
        toast.error(error);
        if (
          error.includes("Bearer token") ||
          error.includes("not logged in") ||
          error.includes("User from sub claim in JWT does not exist")
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
        toast.error(error);
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
            {/* biome-ignore lint/a11y/useAltText: <explanation> */}
            <img
              src={qrCode}
              alt="MFA QR Code"
              width={192}
              height={192}
              className="size-48"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={isVerifying || !code || !factorId}
        >
          {isVerifying ? "Verifying..." : "Verify and Enable"}
        </Button>
      </CardFooter>
    </Card>
  );
}
