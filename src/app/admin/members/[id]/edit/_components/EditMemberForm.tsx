"use client";

import { useStore } from "@tanstack/react-form";
import {
  FileText,
  Globe,
  Plus,
  Trash2,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { useAppForm } from "@/hooks/_formHooks";
import { SIGNED_URL_TTL_SECONDS } from "@/lib/constants";
import {
  IMAGE_UPLOAD_ACCEPT_ATTR,
  IMAGE_UPLOAD_MAX_SIZE,
  isValidImageUploadFile,
  PROFILE_UPLOAD_ACCEPT_ATTR,
} from "@/lib/fileUpload";
import tryCatch from "@/lib/server/tryCatch";
import { COMPANY_PROFILE_BUCKET } from "@/lib/storage/companyProfile";
import { uploadCompanyLogo } from "@/lib/storage/uploadCompanyLogo";
import { createClient } from "@/lib/supabase/client";
import { cn, zodValidator } from "@/lib/utils";
import {
  type UpdateMemberInput,
  UpdateMemberSchema,
} from "@/lib/validation/members/update";
import { updateMember } from "@/server/members/mutations/updateMember";

interface EditMemberFormProps {
  member: {
    memberId: string;
    applicationId: string;
    businessName: string;
    companyAddress: string;
    emailAddress: string;
    websiteURL?: string | null;
    logoImageURL?: string | null;
    landline: string;
    faxNumber?: string | null;
    mobileNumber?: string | null;
    sectorId: string;
    companyProfileType?: "image" | "document" | "website" | null;
    representatives: Array<{
      applicationMemberId: string;
      firstName: string;
      lastName: string;
      emailAddress: string;
      mobileNumber: string;
      landline: string;
      mailingAddress: string;
      companyDesignation: string;
      companyMemberType: "principal" | "alternate";
      birthdate: string;
      nationality: string;
      sex: "male" | "female";
    }>;
    membershipStatus?: "paid" | "unpaid" | "cancelled" | null;
    joinDate?: string | null;
    membershipExpiryDate?: string | null;
  };
  sectors: { sectorId: number; sectorName: string }[];
}

const emptyRepresentative = (companyMemberType: "principal" | "alternate") => ({
  applicationMemberId: "",
  firstName: "",
  lastName: "",
  emailAddress: "",
  mobileNumber: "",
  landline: "",
  mailingAddress: "",
  companyDesignation: "",
  companyMemberType,
  birthdate: new Date(),
  nationality: "",
  sex: "male" as const,
});

function normalizeRepresentatives(
  representatives: EditMemberFormProps["member"]["representatives"],
) {
  const principal = representatives.find(
    (representative) => representative.companyMemberType === "principal",
  );
  const alternate = representatives.find(
    (representative) => representative.companyMemberType === "alternate",
  );

  const result = [
    principal
      ? {
          ...principal,
          birthdate: principal.birthdate
            ? new Date(principal.birthdate)
            : new Date(),
        }
      : emptyRepresentative("principal"),
  ];

  if (alternate) {
    result.push({
      ...alternate,
      birthdate: alternate.birthdate
        ? new Date(alternate.birthdate)
        : (undefined as unknown as Date),
    });
  }

  return result;
}

export function EditMemberForm({ member, sectors }: EditMemberFormProps) {
  const router = useRouter();
  const representativeKeysRef = useRef(new WeakMap<object, string>());

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [companyProfilePreview, setCompanyProfilePreview] = useState<
    string | null
  >(null);
  const [signedProfileUrl, setSignedProfileUrl] = useState<string | null>(null);
  const [logoDragActive, setLogoDragActive] = useState(false);

  const handleLogoDrag = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setLogoDragActive(true);
      } else if (e.type === "dragleave") {
        setLogoDragActive(false);
      }
    },
    [],
  );

  const handleLogoDrop = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setLogoDragActive(false);
    },
    [],
  );

  const defaultValues = {
    ...member,
    companyProfileType: member.companyProfileType ?? undefined,
    logoImageURL: member.logoImageURL ?? "",
    logoImage: undefined as File | undefined,
    companyProfileTypeToggle:
      member.companyProfileType === "image" ||
      member.companyProfileType === "document"
        ? "file"
        : ("website" as "file" | "website"),
    companyProfileFile: undefined as File | undefined,
    websiteURL:
      member.companyProfileType === "image" ||
      member.companyProfileType === "document"
        ? undefined
        : (member.websiteURL ?? undefined),
    faxNumber: member.faxNumber ?? undefined,
    mobileNumber: member.mobileNumber ?? undefined,
    membershipStatus: member.membershipStatus ?? undefined,
    joinDate: member.joinDate ? new Date(member.joinDate) : undefined,
    membershipExpiryDate: member.membershipExpiryDate
      ? new Date(member.membershipExpiryDate)
      : undefined,
    representatives: normalizeRepresentatives(member.representatives),
  };

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: zodValidator(UpdateMemberSchema),
    },
    onSubmit: async ({ value }) => {
      let finalWebsiteURL = value.websiteURL;
      let finalLogoImageURL: string = value.logoImageURL ?? "";
      let finalCompanyProfileType: "image" | "document" | "website" | undefined;

      if (
        value.companyProfileTypeToggle === "file" &&
        value.companyProfileFile instanceof File
      ) {
        const profileFile = value.companyProfileFile;
        finalCompanyProfileType = profileFile.type.startsWith("image/")
          ? "image"
          : "document";

        const { error: uploadError, data: uploadedPath } = await tryCatch(
          (async () => {
            const { v4: uuidv4 } = await import("uuid");
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = await createClient();
            const fileExt = profileFile.name.split(".").pop();
            const fileName = `profile-${uuidv4()}.${fileExt}`;
            const { data, error: storageError } = await supabase.storage
              .from(COMPANY_PROFILE_BUCKET)
              .upload(fileName, profileFile);
            if (storageError) throw storageError;
            return data.path;
          })(),
        );

        if (uploadError) {
          toast.error(uploadError);
          return;
        }

        if (uploadedPath) {
          finalWebsiteURL = uploadedPath;
        }
      } else if (value.companyProfileTypeToggle === "website") {
        finalCompanyProfileType = "website";
      }

      if (value.logoImage instanceof File && value.logoImage.size > 0) {
        const { error: uploadError, data: uploadedPath } = await tryCatch(
          uploadCompanyLogo(value.logoImage),
        );

        if (uploadError) {
          toast.error(uploadError);
          return;
        }

        if (uploadedPath) {
          finalLogoImageURL = uploadedPath;
        }
      }

      // Pre-process alternate representative: all-empty or all-filled, no partial
      let representatives = value.representatives;
      if (representatives.length >= 2) {
        const alt = representatives[1];
        const textFields = [
          alt.firstName,
          alt.lastName,
          alt.emailAddress,
          alt.companyDesignation,
          alt.nationality,
          alt.mailingAddress,
          alt.mobileNumber,
          alt.landline,
        ] as string[];
        const anyFilled = textFields.some((v) => v?.trim().length > 0);
        const allFilled = textFields.every((v) => v?.trim().length > 0);

        if (anyFilled && !allFilled) {
          toast.error(
            "If providing alternate member details, all fields must be filled.",
          );
          return;
        }

        if (!anyFilled) {
          representatives = [representatives[0]];
        }
      }

      const parsedValues = UpdateMemberSchema.parse({
        ...value,
        websiteURL: finalWebsiteURL,
        companyProfileType: finalCompanyProfileType,
        representatives,
      });

      const dataToSubmit: UpdateMemberInput & { logoImageURL?: string } = {
        ...parsedValues,
        logoImageURL: finalLogoImageURL,
        mobileNumber: parsedValues.mobileNumber || undefined,
        membershipStatus: (parsedValues.membershipStatus || undefined) as
          | "paid"
          | "unpaid"
          | "cancelled"
          | undefined,
        joinDate: parsedValues.joinDate
          ? new Date(parsedValues.joinDate)
          : undefined,
        membershipExpiryDate: parsedValues.membershipExpiryDate
          ? new Date(parsedValues.membershipExpiryDate)
          : undefined,
        sectorId: Number(parsedValues.sectorId),
      };

      const { error, success } = await tryCatch(updateMember(dataToSubmit));

      if (!success) {
        toast.error(error);
        return;
      }

      toast.success("Member details updated successfully");
      router.push(`/admin/members/${value.memberId}`);
      router.refresh();
    },
  });

  const getRepresentativeKey = (representative: object) => {
    const existingKey = representativeKeysRef.current.get(representative);

    if (existingKey) {
      return existingKey;
    }

    const nextKey = crypto.randomUUID();
    representativeKeysRef.current.set(representative, nextKey);
    return nextKey;
  };

  const logoFieldValue = useStore(
    form.store,
    (state) => state.values.logoImage,
  );

  useEffect(() => {
    if (logoFieldValue instanceof File) {
      const url = URL.createObjectURL(logoFieldValue);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setLogoPreview(null);
  }, [logoFieldValue]);

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

  // Sign the existing company profile URL for private bucket access
  useEffect(() => {
    const websiteURL = member.websiteURL;
    if (
      (member.companyProfileType === "image" ||
        member.companyProfileType === "document") &&
      typeof websiteURL === "string" &&
      websiteURL.trim()
    ) {
      createClient().then((supabase) => {
        supabase.storage
          .from(COMPANY_PROFILE_BUCKET)
          .createSignedUrl(websiteURL, SIGNED_URL_TTL_SECONDS)
          .then(({ data }) => setSignedProfileUrl(data?.signedUrl ?? null));
      });
    } else {
      setSignedProfileUrl(null);
    }
  }, [member.websiteURL, member.companyProfileType]);

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Edit Member Details</h1>
        <p className="text-muted-foreground">
          Update the member and application information.
        </p>
      </div>

      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.AppField name="businessName">
            {(field) => <field.TextField label="Company Name" />}
          </form.AppField>

          <form.AppField name="sectorId">
            {(field) => (
              <field.SingleComboBoxField
                allowCustom
                label="Industry/Sector"
                options={sectors.map((s) => ({
                  label: s.sectorName,
                  value: s.sectorId.toString(),
                }))}
                placeholder="Search or type your industry"
              />
            )}
          </form.AppField>

          <form.AppField name="companyAddress">
            {(field) => (
              <field.TextareaField
                className="md:col-span-2"
                label="Company Address"
              />
            )}
          </form.AppField>

          <div className="space-y-3 md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.AppField name="companyProfileTypeToggle">
                {(field) => (
                  <div className="space-y-3">
                    <Label className="font-semibold text-foreground text-sm">
                      Company Profile
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
                  <field.TextField label="Email Address" type="email" />
                )}
              </form.AppField>
            </div>

            <form.Subscribe
              selector={(state) => state.values.companyProfileTypeToggle}
            >
              {(companyProfileTypeToggle) =>
                companyProfileTypeToggle === "website" ? (
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
                      const selectedFile = field.state.value as
                        | File
                        | undefined;
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
                            ) : (member.companyProfileType === "image" ||
                                member.companyProfileType === "document") &&
                              member.websiteURL ? (
                              <>
                                {member.companyProfileType === "image" &&
                                signedProfileUrl ? (
                                  <Image
                                    alt="Current company profile"
                                    className="h-16 w-16 rounded-md object-contain"
                                    height={64}
                                    src={signedProfileUrl}
                                    unoptimized
                                    width={64}
                                  />
                                ) : null}
                                <span className="font-medium text-muted-foreground">
                                  Current company profile
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  Click to upload or drag and drop to replace
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

          <form.AppField name="landline">
            {(field) => <field.TextField label="Landline" />}
          </form.AppField>

          <form.AppField name="mobileNumber">
            {(field) => <field.TextField label="Mobile Number" />}
          </form.AppField>

          <form.AppField name="logoImage">
            {(field) => {
              const fieldValue = field.state.value;
              const hasFile = fieldValue instanceof File;
              const hasLogoUrl =
                typeof form.state.values.logoImageURL === "string" &&
                form.state.values.logoImageURL.length > 0;
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field
                  className="grid gap-2 md:col-span-2"
                  data-invalid={isInvalid}
                >
                  <Label className="font-semibold text-foreground text-sm">
                    Company Logo
                  </Label>

                  {hasLogoUrl && !hasFile ? (
                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Image
                          alt="Logo"
                          className="h-8 w-8 object-contain"
                          height={32}
                          src={form.state.values.logoImageURL}
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
                    <div className="space-y-2">
                      <button
                        aria-invalid={isInvalid}
                        className={cn(
                          "relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
                          hasFile &&
                            "border-emerald-500 bg-emerald-50/60 dark:border-emerald-400/70 dark:bg-emerald-500/15",
                          !hasFile &&
                            "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                          logoDragActive &&
                            !hasFile &&
                            "border-primary bg-primary/5",
                          isInvalid &&
                            "border-destructive bg-destructive/5 hover:border-destructive",
                        )}
                        onDragEnter={handleLogoDrag}
                        onDragLeave={handleLogoDrag}
                        onDragOver={handleLogoDrag}
                        onDrop={(e) => {
                          handleLogoDrop(e);
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
                            {logoPreview ? (
                              <Image
                                alt="Logo preview"
                                className="mt-3 h-16 w-16 rounded-md object-contain"
                                height={64}
                                src={logoPreview}
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
                            onClick={() => {
                              field.handleChange(undefined);
                            }}
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

          <div className="mt-2 border-t pt-6 md:col-span-2">
            <h4 className="mb-4 font-medium text-muted-foreground text-sm uppercase">
              Applicant Representatives
            </h4>
          </div>

          <form.AppField mode="array" name="representatives">
            {(field) => {
              const principalRepresentative = field.state.value[0];
              const hasAlternate = field.state.value.length > 1;
              const alternateRepresentative = hasAlternate
                ? field.state.value[1]
                : null;

              if (!principalRepresentative) {
                return null;
              }

              const addAlternate = () => {
                const empty = emptyRepresentative("alternate");
                field.pushValue({
                  ...empty,
                  birthdate: undefined as unknown as Date,
                });
              };

              const removeAlternate = () => {
                if (field.state.value.length > 1) {
                  field.removeValue(1);
                }
              };

              const representatives = [
                {
                  keyRepresentative: principalRepresentative,
                  title: "Principal Member",
                  index: 0,
                },
                ...(hasAlternate && alternateRepresentative
                  ? [
                      {
                        keyRepresentative: alternateRepresentative,
                        title: "Alternate Member",
                        index: 1,
                      },
                    ]
                  : []),
              ];

              return (
                <div className="space-y-5 sm:space-y-6 md:col-span-2">
                  {representatives.map((representativeMeta) => (
                    <Card
                      className="gap-0 overflow-hidden rounded-xl border-border/50 bg-background shadow-sm"
                      key={getRepresentativeKey(
                        representativeMeta.keyRepresentative,
                      )}
                    >
                      <div className="border-b px-5 py-4 pt-0 sm:px-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <CardTitle className="flex min-w-0 items-center gap-2 font-bold text-base text-primary leading-snug">
                            <User className="h-4 w-4" />
                            {representativeMeta.title}
                          </CardTitle>
                          {representativeMeta.index === 1 && (
                            <Button
                              className="h-8 w-8"
                              onClick={removeAlternate}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-5 sm:p-6">
                        <FieldGroup className="gap-3">
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                            <form.AppField
                              name={`representatives[${representativeMeta.index}].firstName`}
                            >
                              {(subField) => (
                                <subField.TextField
                                  label="First Name"
                                  placeholder="Enter first name"
                                />
                              )}
                            </form.AppField>

                            <form.AppField
                              name={`representatives[${representativeMeta.index}].lastName`}
                            >
                              {(subField) => (
                                <subField.TextField
                                  label="Last Name"
                                  placeholder="Enter last name"
                                />
                              )}
                            </form.AppField>
                          </div>

                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                            <form.AppField
                              name={`representatives[${representativeMeta.index}].companyDesignation`}
                            >
                              {(subField) => (
                                <subField.TextField
                                  label="Position / Designation"
                                  placeholder="e.g. President, Director"
                                />
                              )}
                            </form.AppField>

                            {representativeMeta.index === 0 ? (
                              <form.AppField
                                name={`representatives[${representativeMeta.index}].birthdate`}
                              >
                                {(subField) => (
                                  <subField.FormDatePicker label="Birthdate" />
                                )}
                              </form.AppField>
                            ) : (
                              <form.AppField
                                name={`representatives[${representativeMeta.index}].birthdate`}
                              >
                                {(subField) => (
                                  <subField.FormDatePicker
                                    clearable
                                    label="Birthdate"
                                  />
                                )}
                              </form.AppField>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                            <form.AppField
                              name={`representatives[${representativeMeta.index}].emailAddress`}
                            >
                              {(subField) => (
                                <subField.TextField
                                  label="Email Address"
                                  placeholder="name@example.com"
                                  type="email"
                                />
                              )}
                            </form.AppField>

                            <form.AppField
                              name={`representatives[${representativeMeta.index}].mobileNumber`}
                            >
                              {(subField) => (
                                <subField.TextField
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
                                  placeholder="+639XXXXXXXX or 09XXXXXXXXX"
                                />
                              )}
                            </form.AppField>
                          </div>

                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                            <form.AppField
                              name={`representatives[${representativeMeta.index}].sex`}
                            >
                              {(subField) => (
                                <subField.RadioGroupField
                                  label="Gender"
                                  options={[
                                    { value: "male", label: "Male" },
                                    { value: "female", label: "Female" },
                                  ]}
                                />
                              )}
                            </form.AppField>

                            <form.AppField
                              name={`representatives[${representativeMeta.index}].nationality`}
                            >
                              {(subField) => (
                                <subField.TextField
                                  label="Nationality"
                                  placeholder="e.g. Filipino"
                                />
                              )}
                            </form.AppField>
                          </div>

                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                            <form.AppField
                              name={`representatives[${representativeMeta.index}].mailingAddress`}
                            >
                              {(subField) => (
                                <subField.TextField
                                  label="Mailing Address"
                                  placeholder="Enter mailing address"
                                />
                              )}
                            </form.AppField>

                            <form.AppField
                              name={`representatives[${representativeMeta.index}].landline`}
                            >
                              {(subField) => (
                                <subField.TextField
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
                          </div>
                        </FieldGroup>
                      </CardContent>
                    </Card>
                  ))}

                  {!hasAlternate && (
                    <Button
                      className="w-full"
                      onClick={addAlternate}
                      type="button"
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Alternate Representative (optional)
                    </Button>
                  )}
                </div>
              );
            }}
          </form.AppField>

          <div className="mt-2 border-t pt-6 md:col-span-2">
            <h4 className="mb-4 font-medium text-muted-foreground text-sm uppercase">
              Membership Details
            </h4>
          </div>

          <form.AppField name="membershipStatus">
            {(field) => (
              <field.SelectField
                label="Status"
                options={[
                  { label: "Paid", value: "paid" },
                  { label: "Unpaid", value: "unpaid" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
              />
            )}
          </form.AppField>

          <form.AppField name="joinDate">
            {(field) => <field.FormDatePicker label="Join Date" />}
          </form.AppField>

          <form.AppField name="membershipExpiryDate">
            {(field) => <field.FormDatePicker label="Expiry Date" />}
          </form.AppField>
        </div>

        <div className="flex items-center gap-4 border-t pt-4">
          <Button onClick={() => router.back()} type="button" variant="outline">
            Cancel
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
