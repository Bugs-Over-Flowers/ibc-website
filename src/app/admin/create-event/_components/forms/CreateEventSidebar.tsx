"use client";

import {
  Calendar,
  CalendarDays,
  Eye,
  FileImage,
  Globe,
  Lock,
  MapPin,
  Save,
  Send,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CreateEventAppForm } from "./types";

type CreateEventSidebarProps = {
  form: CreateEventAppForm;
  onCancel: () => void;
  onSaveDraft: () => void;
  onPublishCurrent: () => void;
};

export default function CreateEventSidebar({
  form,
  onCancel,
  onSaveDraft,
  onPublishCurrent,
}: CreateEventSidebarProps) {
  return (
    <div className="space-y-4 xl:sticky xl:top-[72px]">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-bold text-sm uppercase tracking-widest">
            Publishing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.Subscribe selector={(state) => state.values.eventType}>
            {(eventType) => (
              <div className="space-y-2">
                <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Visibility
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        value: "public" as const,
                        icon: Globe,
                        label: "Public",
                      },
                      {
                        value: "private" as const,
                        icon: Lock,
                        label: "Private",
                      },
                    ] as const
                  ).map(({ value, icon: Icon, label }) => {
                    const isActive = eventType === value;
                    return (
                      <button
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-3 font-semibold text-xs transition-all",
                          isActive
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                        )}
                        key={value}
                        onClick={() => form.setFieldValue("eventType", value)}
                        type="button"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    );
                  })}
                </div>
                {!eventType ? (
                  <p className="text-muted-foreground text-xs">
                    Select visibility to enable direct publish from sidebar.
                  </p>
                ) : null}
              </div>
            )}
          </form.Subscribe>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className="space-y-2">
                <Button
                  className="w-full gap-2 rounded-xl text-sm"
                  disabled={isSubmitting}
                  onClick={onSaveDraft}
                  type="button"
                  variant="outline"
                >
                  <Save className="h-4 w-4" />
                  Save as Draft
                </Button>

                <form.Subscribe selector={(state) => state.values.eventType}>
                  {(eventType) => (
                    <Button
                      className="w-full gap-2 rounded-xl text-sm"
                      disabled={isSubmitting || !eventType}
                      onClick={onPublishCurrent}
                      type="button"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Publishing..." : "Publish Event"}
                    </Button>
                  )}
                </form.Subscribe>

                <button
                  className="w-full py-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
                  onClick={onCancel}
                  type="button"
                >
                  Cancel and go back
                </button>
              </div>
            )}
          </form.Subscribe>
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
          <form.Subscribe
            selector={(state) => ({
              title: state.values.eventTitle,
              venue: state.values.venue,
              startDate: state.values.eventStartDate,
              fee: state.values.registrationFee,
              eventType: state.values.eventType,
              eventImage: state.values.eventImage as File[] | null,
              eventPoster: state.values.eventPoster as File[] | null,
            })}
          >
            {({
              title,
              venue,
              startDate,
              fee,
              eventType,
              eventImage,
              eventPoster,
            }) => {
              const selectedImage = eventImage?.[0] ?? null;
              const selectedPoster = eventPoster?.[0] ?? null;
              const dateLabel = startDate
                ? new Date(startDate).toLocaleDateString()
                : null;

              return (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
                    {selectedImage ? (
                      <LocalImagePreview file={selectedImage} />
                    ) : (
                      <div className="flex h-20 items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                        <FileImage className="h-6 w-6 text-primary/30" />
                      </div>
                    )}

                    <div className="space-y-1.5 p-3">
                      <p className="truncate font-bold text-foreground text-sm">
                        {title || "Event title..."}
                      </p>
                      <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
                        {dateLabel ? (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {dateLabel}
                          </span>
                        ) : null}
                        {venue ? (
                          <span className="truncate">{venue}</span>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className="py-0 text-[10px]" variant="outline">
                          {eventType === "private" ? "Private" : "Public"}
                        </Badge>
                        <p className="font-bold text-primary text-sm">
                          {Number(fee) > 0
                            ? `PHP ${Number(fee).toLocaleString()}`
                            : "Free"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <article className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
                    <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted/20">
                      {selectedPoster ? (
                        <LocalImagePreview
                          alt={title || "Event image"}
                          className="h-full w-full"
                          file={selectedPoster}
                          imageClassName="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                          <FileImage className="h-6 w-6 text-primary/30" />
                        </div>
                      )}

                      {selectedPoster ? (
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent" />
                      ) : null}

                      <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center rounded-full border border-white/15 bg-black/55 px-2 py-0.5 font-medium text-[10px] text-white uppercase tracking-widest backdrop-blur-md">
                          {eventType === "private" ? "Private" : "Public"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <h3 className="line-clamp-2 font-medium text-base text-foreground leading-snug">
                        {title || "Event title..."}
                      </h3>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
                          <MapPin className="mt-px h-3 w-3 shrink-0 text-muted-foreground/50" />
                          <span className="line-clamp-1">
                            {venue || "Venue not set"}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-muted-foreground text-sm">
                          <Calendar className="mt-px h-3 w-3 shrink-0 text-muted-foreground/50" />
                          <div className="flex flex-col gap-0.5">
                            <span>{dateLabel || "Date not set"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mx-4 h-px bg-border/50" />

                    <div className="flex items-center justify-between bg-muted/20 px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="h-3 w-3 text-muted-foreground/50" />
                        <span
                          className={cn(
                            "tabular-nums",
                            Number(fee) === 0
                              ? "font-medium text-[#27500A] text-sm dark:text-[#9FE1CB]"
                              : "font-medium text-base text-foreground",
                          )}
                        >
                          {Number(fee) === 0
                            ? "Free"
                            : `₱${Number(fee).toLocaleString()}`}
                        </span>
                      </div>

                      <button
                        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted/50 hover:text-foreground"
                        title="Preview event"
                        type="button"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                </div>
              );
            }}
          </form.Subscribe>
        </CardContent>
      </Card>
    </div>
  );
}

type LocalImagePreviewProps = {
  file: File;
  className?: string;
  imageClassName?: string;
  alt?: string;
};

function LocalImagePreview({
  file,
  className,
  imageClassName,
  alt = "Event preview",
}: LocalImagePreviewProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!src) {
    return (
      <div
        className={cn(
          "flex h-20 items-center justify-center bg-linear-to-br from-primary/10 to-primary/5",
          className,
        )}
      >
        <FileImage className="h-6 w-6 text-primary/30" />
      </div>
    );
  }

  return (
    <div className={cn("relative h-20 w-full", className)}>
      <Image
        alt={alt}
        className={cn("object-cover", imageClassName)}
        fill
        src={src}
        unoptimized
      />
    </div>
  );
}
