"use client";

import { Building2, CheckCircle2, Eye, MapPin, Save } from "lucide-react";
import Image from "next/image";
import type { NetworkFormState } from "@/app/admin/networks/_components/networkForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CreateNetworkSidebarProps = {
  formState: NetworkFormState;
  currentLogo: string | null;
  isSaving: boolean;
  isUploading: boolean;
  isValid: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  onCancel: () => void;
  onCreate: () => void;
};

function RepAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 font-medium text-[10px] text-secondary">
      {initials || "NA"}
    </div>
  );
}

export default function CreateNetworkSidebar({
  formState,
  currentLogo,
  isSaving,
  isUploading,
  isValid,
  submitLabel = "Create Network",
  submittingLabel = "Creating Network...",
  onCancel,
  onCreate,
}: CreateNetworkSidebarProps) {
  const filledCount = [
    formState.organization,
    formState.about,
    formState.locationType,
    formState.representativeName,
    formState.representativePosition,
  ].filter((value) => value.trim().length > 0).length;

  return (
    <div className="space-y-4 xl:sticky xl:top-[72px]">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-bold text-sm uppercase tracking-widest">
            Publishing
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Completion
            </p>
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm">
                {filledCount} of 5 required fields
              </span>
              <Badge variant={isValid ? "default" : "outline"}>
                {isValid ? "Ready" : "In progress"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full gap-2 rounded-xl text-sm"
              disabled={isSaving || isUploading}
              onClick={onCreate}
              type="button"
            >
              <Save className="h-4 w-4" />
              {isSaving ? submittingLabel : submitLabel}
            </Button>

            <button
              className="w-full py-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
              onClick={onCancel}
              type="button"
            >
              Cancel and go back
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest">
            <Eye className="h-4 w-4 text-primary" />
            Preview
          </CardTitle>
        </CardHeader>

        <CardContent>
          <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-start gap-3 border-border border-b px-4 py-4">
              <div className="relative flex aspect-square size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-popover">
                {currentLogo ? (
                  <Image
                    alt="Network logo preview"
                    className="object-cover"
                    fill
                    sizes="44px"
                    src={currentLogo}
                    unoptimized
                  />
                ) : (
                  <Building2 className="size-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="line-clamp-2 font-medium text-card-foreground text-sm leading-snug">
                  {formState.organization || "Organization name..."}
                </h3>

                <span className="inline-flex w-fit items-center gap-1 rounded-full border border-ring/30 bg-primary/10 px-2 py-0.5 font-medium text-[11px] text-primary">
                  <MapPin className="size-2.5 shrink-0" />
                  {formState.locationType || "Type not set"}
                </span>
              </div>
            </div>

            <div className="flex-1 px-4 py-3">
              <p className="line-clamp-3 text-muted-foreground text-xs leading-relaxed">
                {formState.about ||
                  "A short organization description will appear here as you type."}
              </p>
            </div>

            <div className="flex items-center gap-2.5 border-border border-t bg-muted/20 px-4 py-3">
              <RepAvatar
                name={formState.representativeName || "Representative"}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-card-foreground text-xs">
                  {formState.representativeName || "Representative..."}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {formState.representativePosition || "Position..."}
                </p>
              </div>
              {isValid ? (
                <span className="inline-flex items-center gap-1 font-medium text-[11px] text-status-green">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ready
                </span>
              ) : null}
            </div>
          </article>
        </CardContent>
      </Card>
    </div>
  );
}
