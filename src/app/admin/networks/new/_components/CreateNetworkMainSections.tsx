"use client";

import { Building2 } from "lucide-react";
import { NetworkFormFields } from "@/app/admin/networks/_components/NetworkFormFields";
import type { NetworkFormState } from "@/app/admin/networks/_components/networkForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CreateNetworkMainSectionsProps = {
  formState: NetworkFormState;
  currentLogo: string | null;
  isUploading: boolean;
  invalidFields: Partial<Record<keyof NetworkFormState, boolean>>;
  title?: string;
  description?: string;
  detailsDescription?: string;
  onFieldChange: (field: keyof NetworkFormState, value: string) => void;
  onLogoUpload: (file: File | undefined) => void;
  onRemoveLogo: () => void;
};

export default function CreateNetworkMainSections({
  formState,
  currentLogo,
  isUploading,
  invalidFields,
  title = "Create New Network",
  description = "Add the organization profile and representative details before publishing this network record.",
  detailsDescription = "Provide organization information, leadership contact, and an optional logo upload.",
  onFieldChange,
  onLogoUpload,
  onRemoveLogo,
}: CreateNetworkMainSectionsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-extrabold text-3xl text-foreground tracking-tight">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl font-medium text-foreground/90 text-md leading-relaxed">
          {description}
        </p>
      </div>

      <Card className="gap-3 overflow-hidden rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="border-border/50 border-b pb-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5 text-primary" />
            Network Details
          </CardTitle>
          <CardDescription>{detailsDescription}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
          <NetworkFormFields
            currentLogo={currentLogo}
            formState={formState}
            invalidFields={invalidFields}
            isUploading={isUploading}
            onFieldChange={onFieldChange}
            onLogoUpload={onLogoUpload}
            onRemoveLogo={onRemoveLogo}
          />
        </CardContent>
      </Card>
    </div>
  );
}
