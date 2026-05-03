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
import { IMAGE_UPLOAD_ACCEPT_ATTR } from "@/lib/fileUpload";
import { cn } from "@/lib/utils";
import type { CreateEventAppForm } from "./types";

type CreateEventMainSectionsProps = {
  form: CreateEventAppForm;
};

export default function CreateEventMainSections({
  form,
}: CreateEventMainSectionsProps) {
  const [dragActiveImage, setDragActiveImage] = useState(false);
  const [dragActivePoster, setDragActivePoster] = useState(false);

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
          Create New Event
        </h1>
        <p className="mt-2 max-w-3xl font-medium text-foreground/90 text-md leading-relaxed">
          Set event details, schedule, pricing, and upload visuals before
          publishing your event.
        </p>
      </div>

      <Card className="gap-3 overflow-hidden rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="border-border/50 border-b pb-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="h-5 w-5 text-primary" />
            Event Details
          </CardTitle>
          <CardDescription>
            Add the core information attendees will see before registration.
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
                description="Optional link to the official Facebook event page"
                label="Facebook Event Link"
                placeholder="https://www.facebook.com/events/..."
              />
            )}
          </form.AppField>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="border-border/50 border-b pb-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Info className="h-5 w-5 text-primary" />
            Schedule and Pricing
          </CardTitle>
          <CardDescription>
            Define when the event happens, where it will be held, and the
            registration fee.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="eventStartDate">
              {(field) => <field.FormCalendar label="Event Start Date *" />}
            </form.AppField>

            <form.AppField name="eventEndDate">
              {(field) => <field.FormCalendar label="Event End Date *" />}
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

          <form.AppField name="registrationFee">
            {(field) => <field.NumberField label="Registration Fee *" />}
          </form.AppField>
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
          {/* Event Header Upload */}
          <form.Subscribe selector={(state) => state.values.eventImage}>
            {(eventImage) => {
              const hasFile = (eventImage as File[] | null)?.[0];
              const preview = hasFile ? URL.createObjectURL(hasFile) : null;

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
                      hasFile && "border-status-green/60 bg-status-green/10",
                      !hasFile &&
                        "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                      dragActiveImage &&
                        !hasFile &&
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
                      accept={IMAGE_UPLOAD_ACCEPT_ATTR}
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

                    {hasFile ? (
                      <div className="relative flex h-full w-full flex-col items-center justify-center">
                        {preview && (
                          <Image
                            alt="Header preview"
                            className="rounded-lg object-cover"
                            fill
                            src={preview}
                          />
                        )}
                        <div className="absolute flex flex-col items-center gap-1 rounded-lg bg-hero-overlay px-3 py-2 backdrop-blur-sm">
                          <span className="font-medium text-hero-text text-xs">
                            {hasFile.name}
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
                          PNG, JPG, JPEG up to 5MB (16:4)
                        </span>
                      </>
                    )}
                  </button>

                  {hasFile && (
                    <div className="flex justify-center pt-2">
                      <Button
                        className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => form.setFieldValue("eventImage", [])}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <X className="mr-1 h-4 w-4" />
                        Remove Header
                      </Button>
                    </div>
                  )}
                </div>
              );
            }}
          </form.Subscribe>

          {/* Event Poster Upload */}
          <form.Subscribe selector={(state) => state.values.eventPoster}>
            {(eventPoster) => {
              const hasFile = (eventPoster as File[] | null)?.[0];
              const preview = hasFile ? URL.createObjectURL(hasFile) : null;

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
                      hasFile && "border-status-green/60 bg-status-green/10",
                      !hasFile &&
                        "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                      dragActivePoster &&
                        !hasFile &&
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
                      accept={IMAGE_UPLOAD_ACCEPT_ATTR}
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

                    {hasFile ? (
                      <div className="relative flex h-full w-full flex-col items-center justify-center">
                        {preview && (
                          <Image
                            alt="Poster preview"
                            className="rounded-lg object-cover"
                            fill
                            src={preview}
                          />
                        )}
                        <div className="absolute flex flex-col items-center gap-1 rounded-lg bg-hero-overlay px-3 py-2 backdrop-blur-sm">
                          <span className="font-medium text-hero-text text-xs">
                            {hasFile.name}
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
                          PNG, JPG, JPEG up to 5MB (1:1)
                        </span>
                      </>
                    )}
                  </button>

                  {hasFile && (
                    <div className="flex justify-center pt-2">
                      <Button
                        className="h-9 rounded-lg border-destructive/30 px-4 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => form.setFieldValue("eventPoster", [])}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <X className="mr-1 h-4 w-4" />
                        Remove Poster
                      </Button>
                    </div>
                  )}
                </div>
              );
            }}
          </form.Subscribe>
        </CardContent>
      </Card>
    </div>
  );
}
