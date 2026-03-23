import { useStore } from "@tanstack/react-form";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { useMembershipStep2 } from "@/app/membership/application/_hooks/useMembershipStep2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  IMAGE_UPLOAD_ACCEPT_ATTR,
  isValidImageUploadFile,
} from "@/lib/fileUpload";
import { preventInvalidKeyDown } from "@/lib/keyboard";
import { cn } from "@/lib/utils";
import type { Sector } from "@/server/membership/queries/getSectors";

interface StepProps {
  form: ReturnType<typeof useMembershipStep2>;
  sectors: Sector[];
}

export function Step2Company({ form, sectors }: StepProps) {
  const sectorOptions = sectors.map((sector) => ({
    value: String(sector.sectorId),
    label: sector.sectorName,
  }));

  const logoImage = useStore(form.store, (state) => state.values.logoImage);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  useEffect(() => {
    if (logoImage instanceof File) {
      const url = URL.createObjectURL(logoImage);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [logoImage]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl p-0 shadow-none">
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="companyName">
              {(field) => (
                <field.TextField
                  label="Company Name"
                  placeholder="Enter your company name"
                />
              )}
            </form.AppField>

            <form.AppField name="sectorId">
              {(field) => (
                <field.SelectField
                  label="Industry/Sector"
                  options={sectorOptions}
                  placeholder="Select industry"
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="companyAddress">
            {(field) => (
              <field.TextField
                label="Company Address"
                placeholder="Enter complete business address"
              />
            )}
          </form.AppField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="websiteURL">
              {(field) => (
                <field.TextField
                  description="Enter your company's website or profile URL"
                  label="Company Profile / Website"
                  placeholder="https://www.example.com"
                />
              )}
            </form.AppField>

            <form.AppField name="emailAddress">
              {(field) => (
                <field.TextField
                  description="We'll send confirmation to this email"
                  label="Email Address"
                  placeholder="company@example.com"
                  type="email"
                />
              )}
            </form.AppField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="landline">
              {(field) => (
                <field.TextField
                  label="Landline"
                  onKeyDown={(e) => preventInvalidKeyDown(e, /[0-9()\-\s]/)}
                  placeholder="(033) XXX-XXXX"
                />
              )}
            </form.AppField>

            <form.AppField name="mobileNumber">
              {(field) => (
                <field.TextField
                  label="Mobile Number"
                  onKeyDown={(e) => preventInvalidKeyDown(e, /[0-9+]/)}
                  placeholder="+63 9XX XXX XXXX"
                />
              )}
            </form.AppField>
          </div>

          <form.Subscribe selector={(state) => state.values.logoImageURL}>
            {(logoImageURL) => (
              <form.AppField name="logoImage">
                {(field) => (
                  <Field
                    className="grid gap-2"
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    {/** Keep existing logo URL preview support while using upload button UI for new files. */}
                    <Label className="font-semibold text-foreground text-sm">
                      Company Logo *
                    </Label>
                    <div className="rounded-xl bg-background p-0">
                      {logoImageURL && !field.state.value ? (
                        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Image
                              alt="Logo"
                              className="h-8 w-8 object-contain"
                              height={32}
                              src={logoImageURL}
                              width={32}
                            />
                            <span className="max-w-[200px] truncate text-sm">
                              Current Logo
                            </span>
                          </div>
                          <Button
                            className="h-8 w-8"
                            onClick={() => {
                              form.setFieldValue("logoImageURL", "");
                            }}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        (() => {
                          const hasFile = field.state.value;
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;

                          return (
                            <div className="space-y-2">
                              <button
                                aria-invalid={isInvalid}
                                className={cn(
                                  "relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
                                  hasFile &&
                                    "border-emerald-500 bg-emerald-50/60 dark:border-emerald-400/70 dark:bg-emerald-500/15",
                                  !hasFile &&
                                    "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                                  dragActive &&
                                    !hasFile &&
                                    "border-primary bg-primary/5",
                                  isInvalid &&
                                    "border-destructive bg-destructive/5 hover:border-destructive",
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={(e) => {
                                  handleDrop(e);
                                  if (e.dataTransfer.files?.[0]) {
                                    const droppedFile = e.dataTransfer.files[0];
                                    if (!isValidImageUploadFile(droppedFile)) {
                                      toast.error("Invalid file");
                                      return;
                                    }

                                    field.handleChange(droppedFile);
                                  }
                                }}
                                type="button"
                              >
                                <input
                                  accept={IMAGE_UPLOAD_ACCEPT_ATTR}
                                  className="absolute inset-0 cursor-pointer opacity-0"
                                  onBlur={field.handleBlur}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) {
                                      return;
                                    }

                                    if (!isValidImageUploadFile(file)) {
                                      toast.error("Invalid file");
                                      return;
                                    }

                                    field.handleChange(file);
                                  }}
                                  tabIndex={-1}
                                  type="file"
                                />

                                {hasFile ? (
                                  <>
                                    {preview ? (
                                      <Image
                                        alt="Logo preview"
                                        className="mt-3 h-12 w-12 rounded-md object-contain"
                                        height={48}
                                        src={preview}
                                        width={48}
                                      />
                                    ) : null}
                                    <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                      Logo Uploaded Successfully
                                    </span>
                                    <Badge className="mt-2" variant="outline">
                                      {hasFile.name}
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

                              {hasFile ? (
                                <div className="mt-3 flex justify-center">
                                  <Button
                                    className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() =>
                                      field.handleChange(undefined)
                                    }
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                  >
                                    <X className="mr-1 h-4 w-4" />
                                    Remove selected logo
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          );
                        })()
                      )}
                    </div>
                    <FieldError errors={field.state.meta.errors} reserveSpace />
                  </Field>
                )}
              </form.AppField>
            )}
          </form.Subscribe>
        </FieldGroup>
      </div>
    </div>
  );
}
