import { useStore } from "@tanstack/react-form";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  MapPin,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { useMembershipStep4 } from "@/app/membership/application/_hooks/useMembershipStep4";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import type { MembershipApplicationData } from "@/hooks/membershipApplication.store";
import { cn } from "@/lib/utils";

interface StepProps {
  form: ReturnType<typeof useMembershipStep4>["form"];
  applicationData: MembershipApplicationData;
}

function isValidPaymentProof(file: File): boolean {
  const isValidType = ["image/png", "image/jpeg", "image/jpg"].includes(
    file.type,
  );

  if (!isValidType) {
    toast.error("Invalid file type");
    return false;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("File size must be less than 5MB");
    return false;
  }

  return true;
}

export function Step5Payment({ form, applicationData }: StepProps) {
  const paymentProof = useStore(
    form.store,
    (state) => state.values.paymentProof,
  );
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const isUpdateInfo = applicationData.step1.applicationType === "updating";

  const handleDrag = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
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
      {isUpdateInfo && (
        <Alert className="rounded-xl border-amber-500/40 bg-amber-50 dark:border-amber-400/50 dark:bg-amber-500/15">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">
            Information Update Fee
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-100/90">
            Updating your membership information requires a processing fee of{" "}
            <span className="font-semibold">P2,000.00</span>. Please complete
            the payment using one of the methods below.
          </AlertDescription>
        </Alert>
      )}

      {!isUpdateInfo && (
        <div className="space-y-4 rounded-xl bg-transparent p-0">
          <div className="font-semibold text-foreground text-lg">
            Select Membership Type
          </div>
          <form.AppField name="applicationMemberType">
            {(field) => {
              const options = [
                {
                  value: "corporate" as const,
                  label: "Corporate",
                  description: "For businesses & organizations",
                  price: "₱10,000",
                  icon: Building2,
                },
                {
                  value: "personal" as const,
                  label: "Personal",
                  description: "For individuals",
                  price: "₱5,000",
                  icon: User,
                },
              ];

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {options.map((option) => {
                      const Icon = option.icon;

                      return (
                        <button
                          className={cn(
                            "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-border bg-transparent p-4 text-center transition-all",
                            field.state.value === option.value &&
                              "border-primary bg-primary/5",
                          )}
                          key={option.value}
                          onClick={() => field.handleChange(option.value)}
                          type="button"
                        >
                          <span
                            className={cn(
                              "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground",
                              field.state.value === option.value &&
                                "border-primary/30 bg-primary/10 text-primary",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="font-semibold text-foreground text-lg">
                            {option.label}
                          </span>
                          <span className="mt-2 font-bold text-primary text-xl">
                            {option.price}
                          </span>
                          <span className="mt-1 text-muted-foreground text-xs">
                            {option.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </div>
              );
            }}
          </form.AppField>
        </div>
      )}

      <div className="space-y-4 rounded-xl bg-transparent p-0">
        <div className="font-semibold text-foreground text-lg">
          Select Payment Method
        </div>

        <form.AppField
          listeners={{
            onChange: ({ value }) => {
              if (value === "ONSITE") {
                form.setFieldValue("paymentProof", undefined);
                form.resetField("paymentProof");
              }
            },
          }}
          name="paymentMethod"
        >
          {(field) => {
            const options = [
              {
                value: "ONSITE" as const,
                label: "Onsite Payment",
                description: "Pay in person at IBC office",
                icon: MapPin,
              },
              {
                value: "BPI" as const,
                label: "Bank Transfer",
                description: "Secure bank transfer via BPI",
                icon: CreditCard,
              },
            ];

            return (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {options.map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        className={cn(
                          "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-border bg-transparent p-4 text-center transition-all",
                          field.state.value === option.value &&
                            "border-primary bg-primary/5",
                        )}
                        key={option.value}
                        onClick={() => field.handleChange(option.value)}
                        type="button"
                      >
                        <span
                          className={cn(
                            "mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground",
                            field.state.value === option.value &&
                              "border-primary/30 bg-primary/10 text-primary",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="font-semibold text-foreground text-lg">
                          {option.label}
                        </span>
                        <span className="mt-1 text-muted-foreground text-sm">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <FieldError errors={field.state.meta.errors} />
              </div>
            );
          }}
        </form.AppField>

        <form.Subscribe selector={(state) => state.values.paymentMethod}>
          {(paymentMethod) =>
            paymentMethod === "ONSITE" && (
              <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-linear-to-br from-primary/5 to-primary/2 p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      IBC Office Location
                    </h4>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Visit us during business hours
                    </p>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border border-border/40 bg-background/50 p-4">
                  <div className="flex flex-col gap-2 text-sm">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium text-foreground leading-relaxed">
                      Rm 105-B, G/F Maryville Bldg.,
                      <br />
                      Marymart Mall, Delgado Street,
                      <br />
                      Iloilo City, Philippines
                    </span>
                  </div>
                </div>
              </div>
            )
          }
        </form.Subscribe>

        <form.Subscribe selector={(state) => state.values.paymentMethod}>
          {(paymentMethod) =>
            paymentMethod === "BPI" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-linear-to-br from-primary/5 to-primary/2 p-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        Bank Transfer Details
                      </h4>
                      <p className="mt-1 text-muted-foreground text-xs">
                        Use your registration ID as payment reference
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg border border-border/40 bg-background/50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bank</span>
                      <span className="font-medium text-foreground">
                        (BPI) Bank of the Philippine Islands
                      </span>
                    </div>
                    <div className="border-border/20 border-t" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Account Number
                      </span>
                      <span className="font-medium font-mono text-foreground">
                        000XXXXXXXX
                      </span>
                    </div>
                    <div className="border-border/20 border-t" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Account Name
                      </span>
                      <span className="font-medium text-foreground">
                        Iloilo Business Club
                      </span>
                    </div>
                  </div>
                </div>

                <form.AppField name="paymentProof">
                  {(field) => {
                    const selectedFile = field.state.value as File | undefined;

                    return (
                      <div className="space-y-2">
                        <Label className="font-semibold text-foreground text-sm">
                          Upload Proof of Payment *
                        </Label>
                        <div className="space-y-2 rounded-xl bg-background p-0">
                          <button
                            className={cn(
                              "relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
                              selectedFile &&
                                "border-emerald-500 bg-emerald-50/60 dark:border-emerald-400/70 dark:bg-emerald-500/15",
                              !selectedFile &&
                                "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                              dragActive &&
                                !selectedFile &&
                                "border-primary bg-primary/5",
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={(e) => {
                              handleDrop(e);
                              if (e.dataTransfer.files?.[0]) {
                                const droppedFile = e.dataTransfer.files[0];
                                if (!isValidPaymentProof(droppedFile)) {
                                  return;
                                }

                                field.handleChange(droppedFile);
                              }
                            }}
                            type="button"
                          >
                            <input
                              accept="image/png,image/jpeg,image/jpg"
                              className="absolute inset-0 cursor-pointer opacity-0"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file || !isValidPaymentProof(file)) {
                                  return;
                                }

                                field.handleChange(file);
                              }}
                              tabIndex={-1}
                              type="file"
                            />

                            {selectedFile ? (
                              <>
                                {proofPreview ? (
                                  <Image
                                    alt="Payment proof preview"
                                    className="mt-3 h-12 w-12 rounded-md object-contain"
                                    height={48}
                                    src={proofPreview}
                                    width={48}
                                  />
                                ) : null}
                                <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                  Proof Uploaded Successfully
                                </span>
                                <Badge className="mt-2" variant="outline">
                                  {selectedFile.name}
                                </Badge>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                                <span className="font-medium text-muted-foreground">
                                  Click to upload or drag and drop
                                </span>
                                <span className="mt-1 text-muted-foreground text-xs">
                                  PNG, JPG up to 5MB
                                </span>
                              </>
                            )}
                          </button>

                          {selectedFile ? (
                            <div className="mt-3 flex justify-center">
                              <Button
                                className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => field.handleChange(undefined)}
                                size="sm"
                                type="button"
                                variant="outline"
                              >
                                <X className="mr-1 h-4 w-4" />
                                Remove payment proof
                              </Button>
                            </div>
                          ) : null}
                        </div>
                        <FieldError errors={field.state.meta.errors} />
                      </div>
                    );
                  }}
                </form.AppField>
              </div>
            )
          }
        </form.Subscribe>
      </div>

      <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center sm:p-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary/60" />
        <div className="font-bold text-xl">Final Verification</div>
        <p className="mx-auto max-w-xl text-muted-foreground text-sm leading-relaxed">
          Please ensure all uploaded documents and provided details are
          accurate. Once submitted, your application will undergo review by the
          Membership Committee.
        </p>
      </div>
    </div>
  );
}
