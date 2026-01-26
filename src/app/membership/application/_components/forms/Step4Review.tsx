import { useStore } from "@tanstack/react-form";
import { AlertCircle, FileIcon, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { useMembershipStep4 } from "@/app/membership/application/_hooks/useMembershipStep4";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dropzone,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import type { MembershipApplicationData } from "@/hooks/membershipApplication.store";
import { cn } from "@/lib/utils";

interface StepProps {
  form: ReturnType<typeof useMembershipStep4>["form"];
  applicationData: MembershipApplicationData;
}

export function Step4Review({ form, applicationData }: StepProps) {
  const paymentProof = useStore(
    form.store,
    (state) => state.values.paymentProof,
  );
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const isUpdateInfo = applicationData.step1.applicationType === "updating";

  useEffect(() => {
    if (
      paymentProof instanceof File &&
      paymentProof.type.startsWith("image/")
    ) {
      const url = URL.createObjectURL(paymentProof);
      setProofPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setProofPreview(null);
  }, [paymentProof]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">Review Application</h3>
        <p className="text-muted-foreground text-sm">
          Please review your information before submitting.
        </p>
      </div>

      <div className="space-y-6">
        {/* Summary Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">
                {applicationData.step1.applicationType}
              </span>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Company:</span>
              <span className="font-medium">
                {applicationData.step2.companyName}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">
                {applicationData.step2.emailAddress}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">
                {applicationData.step2.mobileNumber}
              </span>
            </div>
            <Separator />
            <div>
              <span className="mb-2 block text-muted-foreground">
                Representatives:
              </span>
              <ul className="space-y-2">
                {applicationData.step3.representatives.map((rep, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Index is used as key because items don't have stable IDs yet
                  <li className="rounded-md bg-muted/50 p-2" key={i}>
                    <span className="block font-semibold">
                      {rep.firstName} {rep.lastName}
                    </span>
                    <span className="text-muted-foreground text-xs capitalize">
                      {rep.companyMemberType} - {rep.companyDesignation}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Membership Type Section - Only show for New Member and Renewal */}
        {!isUpdateInfo && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Membership Type</h3>
            <form.AppField name="applicationMemberType">
              {(field) => (
                <div className="space-y-3">
                  <Label>Select Membership Type *</Label>
                  <div className="flex flex-col space-y-2">
                    <button
                      className={cn(
                        "flex items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent",
                        field.state.value === "corporate"
                          ? "border-primary bg-primary/5"
                          : "border-input",
                      )}
                      onClick={() => field.handleChange("corporate")}
                      type="button"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          field.state.value === "corporate"
                            ? "border-primary bg-primary"
                            : "border-input",
                        )}
                      >
                        {field.state.value === "corporate" && (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <Label className="cursor-pointer">
                        Corporate (10,000 PHP)
                      </Label>
                    </button>
                    <button
                      className={cn(
                        "flex items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent",
                        field.state.value === "personal"
                          ? "border-primary bg-primary/5"
                          : "border-input",
                      )}
                      onClick={() => field.handleChange("personal")}
                      type="button"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          field.state.value === "personal"
                            ? "border-primary bg-primary"
                            : "border-input",
                        )}
                      >
                        {field.state.value === "personal" && (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <Label className="cursor-pointer">
                        Personal (5,000 PHP)
                      </Label>
                    </button>
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.AppField>
          </div>
        )}

        {/* Update Info Fee Notice */}
        {isUpdateInfo && (
          <Alert className="border-amber-500 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">
              Information Update Fee
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              Updating your membership information requires a processing fee of{" "}
              <span className="font-semibold">₱2,000.00</span>. Please complete
              the payment using one of the methods below.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Payment Details</h3>

          <form.AppField name="paymentMethod">
            {(field) => (
              <div className="space-y-3">
                <Label>Select Payment Method *</Label>
                <div className="flex flex-col space-y-2">
                  <button
                    className={cn(
                      "flex items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent",
                      field.state.value === "ONSITE"
                        ? "border-primary bg-primary/5"
                        : "border-input",
                    )}
                    onClick={() => field.handleChange("ONSITE")}
                    type="button"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        field.state.value === "ONSITE"
                          ? "border-primary bg-primary"
                          : "border-input",
                      )}
                    >
                      {field.state.value === "ONSITE" && (
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <Label className="cursor-pointer font-normal">
                      Onsite Payment (Cash/Check at IBC Office)
                    </Label>
                  </button>
                  <button
                    className={cn(
                      "flex items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent",
                      field.state.value === "BPI"
                        ? "border-primary bg-primary/5"
                        : "border-input",
                    )}
                    onClick={() => field.handleChange("BPI")}
                    type="button"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        field.state.value === "BPI"
                          ? "border-primary bg-primary"
                          : "border-input",
                      )}
                    >
                      {field.state.value === "BPI" && (
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <Label className="cursor-pointer font-normal">
                      Online Transfer / Bank Deposit (BPI)
                    </Label>
                  </button>
                </div>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.AppField>

          {/* Conditional Payment Proof Upload */}
          <form.Subscribe selector={(state) => state.values.paymentMethod}>
            {(paymentMethod) =>
              paymentMethod === "BPI" && (
                <form.AppField name="paymentProof">
                  {(field) => (
                    <div className="space-y-2">
                      <Label>Upload Proof of Payment *</Label>
                      <div className="rounded-lg border bg-background p-4">
                        {field.state.value ? (
                          <div className="flex items-center justify-between rounded border bg-muted/20 p-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                              {proofPreview ? (
                                <Image
                                  alt="Payment proof preview"
                                  className="h-16 w-16 rounded object-contain"
                                  height={64}
                                  src={proofPreview}
                                  width={64}
                                />
                              ) : (
                                <FileIcon className="h-8 w-8 shrink-0" />
                              )}
                              <div className="flex flex-col">
                                <span className="max-w-[200px] truncate text-sm">
                                  {field.state.value.name}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  ({(field.state.value.size / 1024).toFixed(1)}{" "}
                                  KB)
                                </span>
                              </div>
                            </div>
                            <Button
                              className="h-8 w-8"
                              onClick={() => field.handleChange(undefined)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Dropzone
                            accept={{
                              "image/*": [".png", ".jpg", ".jpeg"],
                              "application/pdf": [".pdf"],
                            }}
                            maxFiles={1}
                            onDrop={(acceptedFiles) => {
                              if (acceptedFiles.length > 0) {
                                field.handleChange(acceptedFiles[0]);
                              }
                            }}
                          >
                            <DropzoneEmptyState />
                          </Dropzone>
                        )}
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </form.AppField>
              )
            }
          </form.Subscribe>
        </div>
      </div>
    </div>
  );
}
