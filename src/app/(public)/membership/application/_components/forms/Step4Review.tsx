import { FileIcon, X } from "lucide-react";
import type { useMembershipStep4 } from "@/app/(public)/membership/application/_hooks/useMembershipStep4";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Dropzone,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import type { MembershipApplicationData } from "@/hooks/membershipApplication.store";
import type { MembershipApplicationStep4Schema } from "@/lib/validation/membership/application";

interface StepProps {
  form: ReturnType<typeof useMembershipStep4>["form"];
  applicationData: MembershipApplicationData;
}

export function Step4Review({ form, applicationData }: StepProps) {
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

        {/* Membership Type Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Membership Type</h3>
          <form.AppField name="applicationMemberType">
            {(field) => (
              <div className="space-y-3">
                <Label>Select Membership Type *</Label>
                <RadioGroup
                  className="flex flex-col space-y-1"
                  onValueChange={(val) =>
                    field.handleChange(val as "corporate" | "personal")
                  }
                  value={field.state.value}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="corporate" value="corporate" />
                    <Label htmlFor="corporate">Corporate (10,000 PHP)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="personal" value="personal" />
                    <Label htmlFor="personal">Personal (5,000 PHP)</Label>
                  </div>
                </RadioGroup>
                {field.state.meta.errors.length > 0 && (
                  <p className="font-medium text-destructive text-sm">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.AppField>
        </div>

        {/* Payment Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Payment Details</h3>

          <form.AppField name="paymentMethod">
            {(field) => (
              <div className="space-y-3">
                <Label>Select Payment Method *</Label>
                <RadioGroup
                  className="flex flex-col space-y-1"
                  onValueChange={(val) =>
                    field.handleChange(
                      val as MembershipApplicationStep4Schema["paymentMethod"],
                    )
                  }
                  value={field.state.value}
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem id="ONSITE" value="ONSITE" />
                    <Label className="font-normal" htmlFor="ONSITE">
                      Onsite Payment (Cash/Check at IBC Office)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem id="BPI" value="BPI" />
                    <Label className="font-normal" htmlFor="BPI">
                      Online Transfer / Bank Deposit (BPI)
                    </Label>
                  </div>
                </RadioGroup>
                {field.state.meta.errors.length > 0 ? (
                  <p className="font-medium text-destructive text-sm">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
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
                          <div className="flex items-center justify-between rounded border bg-muted/20 p-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileIcon className="h-4 w-4 shrink-0" />
                              <span className="max-w-[200px] truncate text-sm">
                                {field.state.value.name}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                ({(field.state.value.size / 1024).toFixed(1)}{" "}
                                KB)
                              </span>
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
                      {field.state.meta.errors.length > 0 ? (
                        <p className="font-medium text-destructive text-sm">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      ) : null}
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
