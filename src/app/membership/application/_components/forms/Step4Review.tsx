import { useStore } from "@tanstack/react-form";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileIcon,
  MapPin,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import IBCBPIQRCode from "@/../public/info/sampleqr.jpeg";
import type { useMembershipStep4 } from "@/app/membership/application/_hooks/useMembershipStep4";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
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
  const representativeKeysRef = useRef(new WeakMap<object, string>());

  const isUpdateInfo = applicationData.step1.applicationType === "updating";

  const getRepresentativeKey = (representative: object) => {
    const existingKey = representativeKeysRef.current.get(representative);

    if (existingKey) {
      return existingKey;
    }

    const nextKey = crypto.randomUUID();
    representativeKeysRef.current.set(representative, nextKey);
    return nextKey;
  };

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
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50 bg-background shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="mb-2 flex items-center gap-2 font-bold text-primary">
                <Building2 className="h-5 w-5" />
                <h3>Company Profile</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Company Name</span>
                  <span className="text-right font-bold">
                    {applicationData.step2.companyName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    Application Type
                  </span>
                  <span className="font-bold capitalize">
                    {applicationData.step1.applicationType}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Industry Sector</span>
                  <span className="font-medium">
                    Sector #{applicationData.step2.sectorId}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-background shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="mb-2 flex items-center gap-2 font-bold text-primary">
                <MapPin className="h-5 w-5" />
                <h3>Contact Info</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-right font-medium">
                    {applicationData.step2.emailAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-medium">
                    {applicationData.step2.mobileNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Website</span>
                  <span className="max-w-[180px] truncate font-medium">
                    {applicationData.step2.websiteURL || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold">Representatives</h3>
          <div className="grid gap-4">
            {applicationData.step3.representatives.map((rep) => (
              <div
                className="flex items-center justify-between rounded-xl border border-border/50 bg-background p-4 shadow-sm"
                key={getRepresentativeKey(rep)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {rep.firstName?.[0] || ""}
                    {rep.lastName?.[0] || ""}
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      {rep.firstName} {rep.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {rep.companyDesignation}
                    </p>
                  </div>
                </div>
                <span className="rounded-md border px-2 py-1 font-medium text-xs">
                  {rep.companyMemberType === "principal"
                    ? "Principal"
                    : "Alternate"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary/60" />
          <h3 className="font-bold text-xl">Final Verification</h3>
          <p className="mx-auto max-w-xl text-muted-foreground text-sm leading-relaxed">
            Please ensure all uploaded documents and provided details are
            accurate. Once submitted, your application will undergo review by
            the Membership Committee.
          </p>
        </div>

        {/* Membership Type Section - Only show for New Member and Renewal */}
        {!isUpdateInfo && (
          <div className="space-y-4 rounded-xl border border-border/50 bg-background p-5">
            <h3 className="font-semibold text-foreground text-lg">
              Membership Type
            </h3>
            <form.AppField name="applicationMemberType">
              {(field) => (
                <div className="space-y-3">
                  <Label className="font-medium">
                    Select Membership Type *
                  </Label>
                  <div className="flex flex-col space-y-2">
                    <button
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent",
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
                        "flex items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent",
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
          <Alert className="rounded-xl border-amber-500/40 bg-amber-50">
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
        <div className="space-y-4 rounded-xl border border-border/50 bg-background p-5">
          <h3 className="font-semibold text-foreground text-lg">
            Payment Details
          </h3>

          <form.AppField
            listeners={{
              onChange: ({ value }) => {
                // Reset payment proof field and its errors when switching to ONSITE
                if (value === "ONSITE") {
                  form.setFieldValue("paymentProof", undefined);
                  form.resetField("paymentProof");
                }
              },
            }}
            name="paymentMethod"
          >
            {(field) => (
              <div className="space-y-3">
                <Label className="font-medium">Select Payment Method *</Label>
                <div className="flex flex-col space-y-2">
                  <button
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent",
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
                      "flex items-center gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent",
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

          {/* Conditional Onsite Location Info */}
          <form.Subscribe selector={(state) => state.values.paymentMethod}>
            {(paymentMethod) =>
              paymentMethod === "ONSITE" && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-muted/30 p-5 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium text-sm">IBC Office Location</p>
                  <p className="text-muted-foreground text-sm">
                    Rm 105-B, G/F Maryville Bldg., Marymart Mall,
                    <br />
                    Delgado Street, Iloilo City, Philippines
                  </p>
                </div>
              )
            }
          </form.Subscribe>

          {/* Conditional Payment Proof Upload */}
          <form.Subscribe selector={(state) => state.values.paymentMethod}>
            {(paymentMethod) =>
              paymentMethod === "BPI" && (
                <div className="space-y-4">
                  {/* Bank Transfer Details */}
                  <div className="flex flex-col items-center space-y-3 rounded-xl border border-border/50 bg-muted/30 p-6">
                    <h4 className="font-medium text-lg">
                      Bank Transfer Details
                    </h4>
                    <div className="relative h-40 w-40">
                      <Image
                        alt="BPI QR Code"
                        className="rounded-md object-contain"
                        fill
                        src={IBCBPIQRCode}
                      />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      BPI - 000XXXXXXXX
                    </p>
                  </div>

                  <form.AppField name="paymentProof">
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="font-medium">
                          Upload Proof of Payment *
                        </Label>
                        <div className="rounded-xl border border-border/60 bg-background p-4">
                          {field.state.value ? (
                            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
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
                                    (
                                    {(field.state.value.size / 1024).toFixed(1)}{" "}
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
                                "image/png": [".png"],
                                "image/jpeg": [".jpeg"],
                                "image/jpg": [".jpg"],
                              }}
                              maxFiles={1}
                              maxSize={5 * 1024 * 1024}
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
                </div>
              )
            }
          </form.Subscribe>
        </div>
      </div>
    </div>
  );
}
