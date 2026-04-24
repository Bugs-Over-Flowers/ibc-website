"use client";

import { CalendarDays, FileImage, Info, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EditEventFormInstance, EventRow } from "./types";

type EditEventMainSectionsProps = {
  form: EditEventFormInstance;
  event: EventRow;
  isDraft: boolean;
  isPrivatePublished: boolean;
};

export default function EditEventMainSections({
  form,
  event,
  isDraft,
  isPrivatePublished,
}: EditEventMainSectionsProps) {
  const [dragActiveImage, setDragActiveImage] = useState(false);
  const [dragActivePoster, setDragActivePoster] = useState(false);

  const statusDescription = isDraft
    ? "This is a draft event. All fields are editable."
    : isPrivatePublished
      ? "This is a published private event. You can edit details and make it public."
      : "This is a published event. Only title, description, dates, venue, and image can be edited.";

  const handleDrag = (
    e: React.DragEvent,
    setActive: (active: boolean) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setActive(true);
    } else if (e.type === "dragleave") {
      setActive(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    fieldName: "eventImage" | "eventPoster",
    setActive: (active: boolean) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      form.setFieldValue(fieldName, [files[0]]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-extrabold text-3xl text-foreground tracking-tight">
          Edit Event
        </h1>
        <p className="mt-2 max-w-3xl font-medium text-foreground/90 text-md leading-relaxed">
          {statusDescription}
        </p>
      </div>

      <Card className="gap-3 overflow-hidden rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="border-border/50 border-b pb-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Info className="h-5 w-5 text-primary" />
            Event Details
          </CardTitle>
          <CardDescription>
            Update core attendee-facing details for this event.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
          <form.AppField name="eventTitle">
            {(field) => (
              <field.TextField
                label={
                  <span>
                    Event Title <span className="text-destructive">*</span>
                  </span>
                }
                placeholder="Enter event title"
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.RichTextEditor
                label="Description"
                placeholder="Enter event description"
              />
            )}
          </form.AppField>

          <form.AppField name="facebookLink">
            {(field) => (
              <field.TextField
                label="Facebook Link"
                placeholder="https://www.facebook.com/your-event"
                type="url"
              />
            )}
          </form.AppField>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="border-border/50 border-b pb-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="h-5 w-5 text-primary" />
            Schedule and Pricing
          </CardTitle>
          <CardDescription>
            Update the event schedule, venue, and pricing information.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="eventStartDate">
              {(field) => (
                <field.FormDateTimePicker label="Event Start Date *" />
              )}
            </form.AppField>

            <form.AppField name="eventEndDate">
              {(field) => <field.FormDateTimePicker label="Event End Date *" />}
            </form.AppField>
          </div>

          <form.AppField name="venue">
            {(field) => (
              <field.TextField
                label="Venue *"
                placeholder="Enter venue location"
              />
            )}
          </form.AppField>

          {isDraft ? (
            <form.AppField name="registrationFee">
              {(field) => <field.NumberField label="Registration Fee *" />}
            </form.AppField>
          ) : (
            <div className="space-y-2">
              <p className="font-medium text-sm">Registration Fee</p>
              <p className="text-muted-foreground">
                ₱{event.registrationFee.toLocaleString()} (Cannot be edited for
                published events)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="border-border/50 border-b pb-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileImage className="h-5 w-5 text-primary" />
            Event Media
          </CardTitle>
          <CardDescription>
            Upload the primary banner and poster image for event previews.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pb-5 sm:px-6 sm:py-2">
          <form.Subscribe
            selector={(state) => ({
              eventImage: state.values.eventImage as File[] | null,
              eventHeaderUrl: state.values.eventHeaderUrl,
            })}
          >
            {({ eventImage, eventHeaderUrl }) => {
              const hasFile = eventImage?.[0] ?? null;
              const preview = hasFile ? URL.createObjectURL(hasFile) : null;
              const currentImage = eventHeaderUrl;
              const imageSrc = preview || currentImage || null;

              return (
                <div className="space-y-2">
                  <label
                    className="block font-medium text-foreground text-sm"
                    htmlFor="event-header"
                  >
                    Event Header <span className="text-destructive">*</span>
                  </label>
                  <button
                    className={cn(
                      "relative flex aspect-4/1 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
                      imageSrc && "border-status-green/60 bg-status-green/10",
                      !imageSrc &&
                        "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                      dragActiveImage &&
                        !imageSrc &&
                        "border-primary bg-primary/5",
                    )}
                    id="event-header"
                    onDragEnter={(e) => handleDrag(e, setDragActiveImage)}
                    onDragLeave={(e) => handleDrag(e, setDragActiveImage)}
                    onDragOver={(e) => handleDrag(e, setDragActiveImage)}
                    onDrop={(e) =>
                      handleDrop(e, "eventImage", setDragActiveImage)
                    }
                    type="button"
                  >
                    <input
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setFieldValue("eventImage", [file]);
                        }
                      }}
                      tabIndex={-1}
                      type="file"
                    />

                    {imageSrc ? (
                      <div className="relative flex h-full w-full flex-col items-center justify-center">
                        <Image
                          alt="Header preview"
                          className="rounded-lg object-cover"
                          fill
                          src={imageSrc}
                          unoptimized
                        />
                        <div className="absolute flex flex-col items-center gap-1 rounded-lg bg-hero-overlay px-3 py-2 backdrop-blur-sm">
                          <span className="font-medium text-hero-text text-xs">
                            {hasFile ? hasFile.name : "Current header image"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">
                          Click to upload or drag and drop
                        </span>
                        <span className="mt-1 text-muted-foreground text-xs">
                          PNG, JPG, GIF, WebP up to 5MB (16:4)
                        </span>
                      </>
                    )}
                  </button>

                  {imageSrc ? (
                    <div className="flex justify-center pt-2">
                      <Button
                        className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          form.setFieldValue("eventImage", []);
                          form.setFieldValue("eventHeaderUrl", "");
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <X className="mr-1 h-4 w-4" />
                        Remove Header
                      </Button>
                    </div>
                  ) : null}

                  <p className="text-muted-foreground text-xs">
                    {hasFile
                      ? "New header selected. Save changes to replace the current one."
                      : currentImage
                        ? "Current header will be kept unless you upload a new one."
                        : "No header selected. Upload a new image to continue."}
                  </p>
                </div>
              );
            }}
          </form.Subscribe>

          <form.Subscribe
            selector={(state) => ({
              eventPoster: state.values.eventPoster as File[] | null,
              eventPosterUrl: state.values.eventPosterUrl,
            })}
          >
            {({ eventPoster, eventPosterUrl }) => {
              const hasFile = eventPoster?.[0] ?? null;
              const preview = hasFile ? URL.createObjectURL(hasFile) : null;
              const currentPoster = eventPosterUrl;
              const imageSrc = preview || currentPoster || null;

              return (
                <div className="space-y-2">
                  <label
                    className="block font-medium text-foreground text-sm"
                    htmlFor="event-poster"
                  >
                    Event Poster <span className="text-destructive">*</span>
                  </label>
                  <button
                    className={cn(
                      "relative mx-auto flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
                      imageSrc && "border-status-green/60 bg-status-green/10",
                      !imageSrc &&
                        "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                      dragActivePoster &&
                        !imageSrc &&
                        "border-primary bg-primary/5",
                    )}
                    id="event-poster"
                    onDragEnter={(e) => handleDrag(e, setDragActivePoster)}
                    onDragLeave={(e) => handleDrag(e, setDragActivePoster)}
                    onDragOver={(e) => handleDrag(e, setDragActivePoster)}
                    onDrop={(e) =>
                      handleDrop(e, "eventPoster", setDragActivePoster)
                    }
                    type="button"
                  >
                    <input
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setFieldValue("eventPoster", [file]);
                        }
                      }}
                      tabIndex={-1}
                      type="file"
                    />

                    {imageSrc ? (
                      <div className="relative flex h-full w-full flex-col items-center justify-center">
                        <Image
                          alt="Poster preview"
                          className="rounded-lg object-cover"
                          fill
                          src={imageSrc}
                          unoptimized
                        />
                        <div className="absolute flex flex-col items-center gap-1 rounded-lg bg-hero-overlay px-3 py-2 backdrop-blur-sm">
                          <span className="font-medium text-hero-text text-xs">
                            {hasFile ? hasFile.name : "Current poster image"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">
                          Click to upload or drag and drop
                        </span>
                        <span className="mt-1 text-muted-foreground text-xs">
                          PNG, JPG, GIF, WebP up to 5MB (1:1)
                        </span>
                      </>
                    )}
                  </button>

                  {imageSrc ? (
                    <div className="flex justify-center pt-2">
                      <Button
                        className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          form.setFieldValue("eventPoster", []);
                          form.setFieldValue("eventPosterUrl", "");
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <X className="mr-1 h-4 w-4" />
                        Remove Poster
                      </Button>
                    </div>
                  ) : null}

                  <p className="text-muted-foreground text-xs">
                    {hasFile
                      ? "New poster selected. Save changes to replace the current one."
                      : currentPoster
                        ? "Current poster will be kept unless you upload a new one."
                        : "No poster selected. Upload a new image to continue."}
                  </p>
                </div>
              );
            }}
          </form.Subscribe>
        </CardContent>
      </Card>
    </div>
  );
}
