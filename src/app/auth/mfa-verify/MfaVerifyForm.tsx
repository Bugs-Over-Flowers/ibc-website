"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useAction } from "@/hooks/useAction";
import { loginVerifyMfa } from "@/lib/server/mfa";

export function MfaVerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const { execute, isPending } = useAction(loginVerifyMfa, {
    onSuccess: () => {
      toast.success("Logged in successfully");
      router.push("/admin/dashboard");
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
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleVerify();
              }
            }}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={isPending || !code}
        >
          {isPending ? "Verifying..." : "Verify"}
        </Button>
      </CardFooter>
    </Card>
  );
}
