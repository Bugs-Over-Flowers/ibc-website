"use client";

import { AlertCircle, ArrowLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppForm } from "@/hooks/_formHooks";
import tryCatch from "@/lib/server/tryCatch";
import type { ApplicationStatusResponse } from "@/lib/types/application";
import { zodValidator } from "@/lib/utils";
import { checkApplicationStatusSchema } from "@/lib/validation/application/check-status";
import { checkApplicationStatus } from "@/server/applications/queries/checkApplicationStatus";
import { ApplicationStatusResult } from "./ApplicationStatusResult";

export function ApplicationStatusForm() {
  const [result, setResult] = useState<ApplicationStatusResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useAppForm({
    defaultValues: {
      identifier: "",
    },
    validators: {
      onSubmit: zodValidator(checkApplicationStatusSchema),
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setResult(null);
      setSubmitError(null);

      try {
        const { error, data, success } = await tryCatch(
          checkApplicationStatus(value.identifier),
        );

        if (!success || error) {
          const errorMessage =
            error ||
            "Failed to check application status. Please verify your identifier and try again.";
          setSubmitError(errorMessage);
          toast.error(errorMessage);
          return;
        }

        if (data) {
          setResult(data);
          toast.success("Application status retrieved successfully!");
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (result) {
    return (
      <div className="flex w-full flex-col justify-center">
        <div className="fade-in slide-in-from-bottom-4 mx-auto w-full max-w-5xl animate-in space-y-6 duration-500">
          <ApplicationStatusResult result={result} />
          <div className="flex justify-center">
            <Button
              className="border border-white/5 bg-[#1f2937] text-slate-300 shadow-lg transition-all hover:bg-[#374151] hover:text-white"
              onClick={() => {
                setResult(null);
                form.reset();
              }}
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Check Another Application
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md">
        <Card className="overflow-hidden border-white/10 bg-slate-800/50 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6 md:p-8">
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <div className="space-y-2 text-center">
                <h3 className="font-bold text-2xl text-white tracking-tight">
                  Enter Application ID
                </h3>
                <p className="text-slate-400 text-sm">
                  Enter the unique identifier sent to your email to track your
                  status.
                </p>
              </div>

              <div className="space-y-4">
                <form.AppField name="identifier">
                  {(field) => (
                    <div className="space-y-2">
                      <label
                        className="font-medium text-slate-300 text-sm"
                        htmlFor={field.name}
                      >
                        Application Identifier
                      </label>
                      <field.TextField
                        className="h-12 border-slate-700 bg-slate-900/50 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20"
                        placeholder="e.g., ibc-app-xxxxxxxx"
                      />
                    </div>
                  )}
                </form.AppField>

                {/* Error Message */}
                {submitError && (
                  <Alert
                    className="border-red-900/50 bg-red-900/20 text-red-200"
                    variant="destructive"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <form.AppForm>
                  <form.SubmitButton
                    className="h-12 w-full bg-[#0284c5] font-semibold text-base text-white transition-all duration-200 hover:bg-[#026aa0]"
                    isSubmittingLabel="Checking Status..."
                    label={
                      isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Checking Status...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Search className="h-4 w-4" />
                          Check Status
                        </span>
                      )
                    }
                  />
                </form.AppForm>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Can't find your ID?{" "}
            <Link
              className="font-medium text-cyan-500 transition-colors hover:text-cyan-400 hover:underline"
              href="/contact"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
