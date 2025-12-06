"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = await createClient();

      // Check immediately
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/admin/mfa-setup");
        return;
      }

      // Listen for auth changes (e.g. if verified in another tab)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" || session) {
          router.push("/admin/mfa-setup");
        }
      });

      // Also poll every 3 seconds as a fallback
      const interval = setInterval(async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.push("/admin/mfa-setup");
        }
      }, 3000);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    };

    checkSession();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a verification link. Please check your email to
            verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <Spinner className="size-8" />
            <p className="text-sm text-muted-foreground text-center">
              Waiting for verification...
              <br />
              Once verified, you will be redirected automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
