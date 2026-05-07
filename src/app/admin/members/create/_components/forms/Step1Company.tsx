import { useStore } from "@tanstack/react-form";
import { FileText, Globe, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { useCreateManualMemberStep1 } from "@/app/admin/members/create/_hooks/useCreateManualMemberStep1";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  IMAGE_UPLOAD_ACCEPT_ATTR,
  IMAGE_UPLOAD_MAX_SIZE,
  isValidImageUploadFile,
  PROFILE_UPLOAD_ACCEPT_ATTR,
} from "@/lib/fileUpload";
import { cn } from "@/lib/utils";

interface Step1CompanyProps {
  form: ReturnType<typeof useCreateManualMemberStep1>["form"];
  sectors: Array<{ sectorId: number; sectorName: string }>;
}

export function Step1Company({ form, sectors }: Step1CompanyProps) {
  const sectorOptions = sectors.map((sector) => ({
    value: String(sector.sectorId),
    label: sector.sectorName,
  }));

  const logoImage = useStore(form.store, (state) => state.values.logoImageURL);
  const [preview, setPreview] = useState<string | null>(null);
  const [companyProfilePreview, setCompanyProfilePreview] = useState<
    string | null
  >(null);
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
    }
    setPreview(null);
  }, [logoImage]);

  useEffect(() => {
    const fileField = form.store.state.values.companyProfileFile;
    if (fileField instanceof File && fileField.type.startsWith("image/")) {
      const url = URL.createObjectURL(fileField);
      setCompanyProfilePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCompanyProfilePreview(null);
    }
  }, [form.store.state.values.companyProfileFile]);

  return (
    <div className="space-y-8">
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
              <field.SingleComboBoxField
                allowCustom
                label="Industry/Sector"
                options={sectorOptions}
                placeholder="Search or type your industry"
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

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="companyProfileType">
              {(field) => (
                <div className="space-y-3">
                  <Label className="font-semibold text-foreground text-sm">
                    Company Profile *
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-all",
                        field.state.value === "file"
                          ? "border-primary bg-primary/5"
                          : "border-border bg-transparent hover:border-primary/50",
                      )}
                      onClick={() => field.handleChange("file")}
                      type="button"
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground text-xs">
                        Upload File
                      </span>
                    </button>
                    <button
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-all",
                        field.state.value === "website"
                          ? "border-primary bg-primary/5"
                          : "border-border bg-transparent hover:border-primary/50",
                      )}
                      onClick={() => field.handleChange("website")}
                      type="button"
                    >
                      <Globe className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground text-xs">
                        Website URL
                      </span>
                    </button>
                  </div>
                  <FieldError errors={field.state.meta.errors} reserveSpace />
                </div>
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

          <form.Subscribe selector={(state) => state.values.companyProfileType}>
            {(companyProfileType) =>
              companyProfileType === "website" ? (
                <form.AppField name="websiteURL">
                  {(field) => (
                    <field.TextField
                      label="Website URL"
                      placeholder="https://www.example.com"
                    />
                  )}
                </form.AppField>
              ) : (
                <form.AppField name="companyProfileFile">
                  {(field) => {
                    const selectedFile = field.state.value as File | undefined;
                    const isInvalid =
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0;
                    const isPdf = selectedFile?.type === "application/pdf";

                    return (
                      <Field className="grid gap-2" data-invalid={isInvalid}>
                        <Label className="font-semibold text-foreground text-sm">
                          Upload Company Profile
                        </Label>
                        <button
                          aria-invalid={isInvalid}
                          className={cn(
                            "relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
                            selectedFile &&
                              "border-emerald-500 bg-emerald-50/60 dark:border-emerald-400/70 dark:bg-emerald-500/15",
                            !selectedFile &&
                              "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                            isInvalid &&
                              "border-destructive bg-destructive/5 hover:border-destructive",
                          )}
                          type="button"
                        >
                          <input
                            accept={PROFILE_UPLOAD_ACCEPT_ATTR}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              field.handleChange(file);
                            }}
                            tabIndex={-1}
                            type="file"
                          />
                          {selectedFile ? (
                            <>
                              {!isPdf && companyProfilePreview ? (
                                <Image
                                  alt="Company profile preview"
                                  className="mt-3 h-16 w-16 rounded-md object-contain"
                                  height={64}
                                  src={companyProfilePreview}
                                  width={64}
                                />
                              ) : null}
                              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                File Uploaded Successfully
                              </span>
                              <Badge className="mt-2" variant="outline">
                                {isPdf
                                  ? "PDF"
                                  : selectedFile.type
                                      .split("/")[1]
                                      .toUpperCase()}
                              </Badge>
                              <span className="mt-1 max-w-[200px] truncate text-muted-foreground text-xs">
                                {selectedFile.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                              <span className="font-medium text-muted-foreground">
                                Click to upload or drag and drop
                              </span>
                              <span className="mt-1 text-muted-foreground text-xs">
                                PNG, JPG, JPEG, PDF up to 5MB
                              </span>
                            </>
                          )}
                        </button>
                        {selectedFile ? (
                          <div className="flex justify-center">
                            <Button
                              className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => field.handleChange(undefined)}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              <X className="mr-1 h-4 w-4" />
                              Remove file
                            </Button>
                          </div>
                        ) : null}
                        <FieldError
                          errors={field.state.meta.errors}
                          reserveSpace
                        />
                      </Field>
                    );
                  }}
                </form.AppField>
              )
            }
          </form.Subscribe>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.AppField name="landline">
            {(field) => (
              <field.TextField
                label="Landline"
                onKeyDown={(e) => {
                  if (
                    [
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Escape",
                      "Enter",
                      "Home",
                      "End",
                      "ArrowLeft",
                      "ArrowRight",
                    ].includes(e.key) ||
                    ((e.ctrlKey || e.metaKey) &&
                      ["a", "c", "v", "x"].includes(e.key))
                  ) {
                    return;
                  }

                  if (!/[0-9()\-\s]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="(033) XXX-XXXX"
              />
            )}
          </form.AppField>

          <form.AppField name="mobileNumber">
            {(field) => (
              <field.TextField
                label="Mobile Number"
                onKeyDown={(e) => {
                  if (
                    [
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Escape",
                      "Enter",
                      "Home",
                      "End",
                      "ArrowLeft",
                      "ArrowRight",
                    ].includes(e.key) ||
                    ((e.ctrlKey || e.metaKey) &&
                      ["a", "c", "v", "x"].includes(e.key))
                  ) {
                    return;
                  }

                  if (!/[0-9+]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="+63 9XX XXX XXXX"
              />
            )}
          </form.AppField>
        </div>

        <form.AppField name="logoImageURL">
          {(field) => {
            const fieldValue = field.state.value;
            const hasFile = fieldValue instanceof File;
            const hasLogoUrl =
              typeof fieldValue === "string" && fieldValue.length > 0;
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field className="grid gap-2" data-invalid={isInvalid}>
                <Label className="font-semibold text-foreground text-sm">
                  Company Logo *
                </Label>

                {hasLogoUrl && !hasFile ? (
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Image
                        alt="Logo"
                        className="h-8 w-8 object-contain"
                        height={32}
                        src={fieldValue}
                        width={32}
                      />
                      <span className="max-w-[200px] truncate text-sm">
                        Current Logo
                      </span>
                    </div>
                    <Button
                      className="h-8 w-8"
                      onClick={() => field.handleChange("")}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      aria-invalid={isInvalid}
                      className={cn(
                        "relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
                        hasFile &&
                          "border-emerald-500 bg-emerald-50/60 dark:border-emerald-400/70 dark:bg-emerald-500/15",
                        !hasFile &&
                          "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                        dragActive && !hasFile && "border-primary bg-primary/5",
                        isInvalid &&
                          "border-destructive bg-destructive/5 hover:border-destructive",
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={(e) => {
                        handleDrop(e);
                        if (!e.dataTransfer.files?.[0]) {
                          return;
                        }

                        const droppedFile = e.dataTransfer.files[0];
                        if (!isValidImageUploadFile(droppedFile)) {
                          toast.error(
                            "Invalid file. Use PNG, JPG, or JPEG up to 5MB.",
                          );
                          return;
                        }

                        if (droppedFile.size > IMAGE_UPLOAD_MAX_SIZE) {
                          toast.error("File size must be less than 5MB");
                          return;
                        }

                        field.handleChange(droppedFile);
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
                            toast.error(
                              "Invalid file. Use PNG, JPG, or JPEG up to 5MB.",
                            );
                            return;
                          }

                          if (file.size > IMAGE_UPLOAD_MAX_SIZE) {
                            toast.error("File size must be less than 5MB");
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
                              className="mt-3 h-16 w-16 rounded-md object-contain"
                              height={64}
                              src={preview}
                              width={64}
                            />
                          ) : null}
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">
                            Logo Uploaded Successfully
                          </span>
                          <Badge className="mt-2" variant="outline">
                            {fieldValue.type.split("/")[1].toUpperCase()}
                          </Badge>
                          <span className="mt-1 max-w-[200px] truncate text-muted-foreground text-xs">
                            {fieldValue.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                          <span className="font-medium text-muted-foreground">
                            Click to upload or drag and drop
                          </span>
                          <span className="mt-1 text-muted-foreground text-xs">
                            PNG, JPG, JPEG up to 5MB
                          </span>
                        </>
                      )}
                    </button>

                    {hasFile ? (
                      <div className="mt-3 flex justify-center">
                        <Button
                          className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => field.handleChange("")}
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
                )}

                <FieldError errors={field.state.meta.errors} reserveSpace />
              </Field>
            );
          }}
        </form.AppField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <form.AppField name="applicationMemberType">
            {(field) => (
              <field.SelectField
                label="Application Member Type"
                options={[
                  { label: "Corporate", value: "corporate" },
                  { label: "Personal", value: "personal" },
                ]}
              />
            )}
          </form.AppField>

          <form.AppField name="membershipStatus">
            {(field) => (
              <field.SelectField
                label="Initial Membership Status"
                options={[
                  { label: "Paid", value: "paid" },
                  { label: "Unpaid", value: "unpaid" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
              />
            )}
          </form.AppField>
        </div>
      </FieldGroup>
    </div>
  );
}
