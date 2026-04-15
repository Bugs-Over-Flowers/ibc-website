"use client";

import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  FileImage,
  Info,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formContext } from "@/hooks/_formHooks";
import { cn } from "@/lib/utils";
import { useCreateEventForm } from "../../_hooks/createEventHook";

export function CreateEventForm() {
  const { form, router } = useCreateEventForm();

  return (
    <div className="pb-8">
      <div className="px-4 pt-8 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button
              className="px-0 text-primary hover:text-primary/80"
              onClick={() => router.push("/admin/events")}
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Events
            </Button>
          </div>

          <h1 className="mb-4 font-extrabold text-4xl text-foreground tracking-tight md:text-5xl">
            Create New Event
          </h1>
          <p className="max-w-2xl font-medium text-foreground/90 text-lg leading-relaxed">
            Set event details, schedule, pricing, and upload visuals before
            publishing your event.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <formContext.Provider value={form}>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <Card className="gap-3 overflow-hidden rounded-xl border-border/60">
              <CardHeader className="border-border/50 border-b pb-5">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Event Details
                </CardTitle>
                <CardDescription>
                  Add the core information attendees will see before
                  registration.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
                <form.AppField name="eventTitle">
                  {(field) => (
                    <field.TextField
                      label={
                        <span>
                          Event Title{" "}
                          <span className="text-destructive">*</span>
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

            <Card className="overflow-hidden rounded-xl border-border/60">
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
                    {(field) => (
                      <field.FormCalendar label="Event Start Date *" />
                    )}
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

            <Card className="overflow-hidden rounded-xl border-border/60">
              <CardHeader className="border-border/50 border-b pb-5">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileImage className="h-5 w-5 text-primary" />
                  Event Media
                </CardTitle>
                <CardDescription>
                  Upload the primary banner and poster image for event previews.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-5 sm:items-stretch">
                  <div className="col-span-1 flex h-full flex-col sm:col-span-3">
                    <form.AppField name="eventImage">
                      {(field) => (
                        <field.FileDropzoneField
                          accept={{
                            "image/*": [
                              ".jpg",
                              ".jpeg",
                              ".png",
                              ".gif",
                              ".webp",
                            ],
                          }}
                          className="h-full"
                          description="Upload an image for the event header"
                          dropzoneClassName="sm:min-h-[280px]"
                          fullHeight
                          label={
                            <span>
                              Event Header{" "}
                              <span className="text-destructive">*</span>
                            </span>
                          }
                          layout="banner"
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024}
                          previewGridClassName="hidden"
                        />
                      )}
                    </form.AppField>
                  </div>

                  <div className="col-span-1 flex h-full flex-col sm:col-span-2">
                    <form.AppField name="eventPoster">
                      {(field) => (
                        <field.FileDropzoneField
                          accept={{
                            "image/*": [
                              ".jpg",
                              ".jpeg",
                              ".png",
                              ".gif",
                              ".webp",
                            ],
                          }}
                          className="h-full"
                          description="Upload poster image"
                          dropzoneClassName="sm:min-h-[280px]"
                          fullHeight
                          label={
                            <span>
                              Event Poster{" "}
                              <span className="text-destructive">*</span>
                            </span>
                          }
                          layout="grid"
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024}
                          previewGridClassName="hidden"
                        />
                      )}
                    </form.AppField>
                  </div>
                </div>

                <form.Subscribe
                  selector={(state) => ({
                    eventImage: state.values.eventImage as File[] | null,
                    eventPoster: state.values.eventPoster as File[] | null,
                  })}
                >
                  {({ eventImage, eventPoster }) => {
                    const selectedImage = eventImage?.[0] ?? null;
                    const selectedPoster = eventPoster?.[0] ?? null;

                    if (!selectedImage && !selectedPoster) {
                      return null;
                    }

                    return (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-5 sm:items-stretch">
                        {selectedImage && (
                          <div className="col-span-1 flex h-full flex-col sm:col-span-3">
                            <UploadPreviewCard
                              aspectClass="aspect-[16/9]"
                              className="flex-1"
                              file={selectedImage}
                              label="Event Header Preview"
                            />
                          </div>
                        )}
                        {selectedPoster && (
                          <div className="col-span-1 flex h-full flex-col sm:col-span-2">
                            <UploadPreviewCard
                              aspectClass="aspect-square"
                              className="flex-1"
                              file={selectedPoster}
                              label="Event Poster Preview"
                            />
                          </div>
                        )}
                      </div>
                    );
                  }}
                </form.Subscribe>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-xl border-border/60">
              <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
                <div className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/5 p-4 text-sm">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Info className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Choose how to publish this event
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Save as draft to finish later, or create it as public or
                      private when ready.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => router.push("/admin/events")}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>

                  <form.Subscribe selector={(state) => state.isSubmitting}>
                    {(isSubmitting) => (
                      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <Button
                          className="w-full sm:w-auto"
                          disabled={isSubmitting}
                          onClick={() => {
                            form.setFieldValue("eventType", null);
                            form.handleSubmit();
                          }}
                          type="button"
                          variant="outline"
                        >
                          Save as Draft
                        </Button>

                        <Popover>
                          <PopoverTrigger
                            render={
                              <Button
                                className="w-full sm:w-auto"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Creating..." : "Create Event"}
                                <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            }
                          />

                          <PopoverContent align="end" className="w-40 p-0">
                            <div className="flex flex-col">
                              <Button
                                className="justify-start rounded-none"
                                onClick={() => {
                                  form.setFieldValue("eventType", "public");
                                  form.handleSubmit();
                                }}
                                variant="ghost"
                              >
                                Public Event
                              </Button>
                              <Button
                                className="justify-start rounded-none"
                                onClick={() => {
                                  form.setFieldValue("eventType", "private");
                                  form.handleSubmit();
                                }}
                                variant="ghost"
                              >
                                Private Event
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </form.Subscribe>
                </div>
              </CardContent>
            </Card>
          </form>
        </formContext.Provider>
      </div>
    </div>
  );
}

type UploadPreviewCardProps = {
  label: string;
  file: File | null;
  aspectClass: string;
  className?: string;
};

function UploadPreviewCard({
  label,
  file,
  aspectClass,
  className,
}: UploadPreviewCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file) {
    return null;
  }

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      <p className="font-medium text-sm">{label}</p>
      <div className="flex-1">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-lg border bg-muted/20 sm:aspect-auto sm:h-full sm:min-h-[280px]",
            aspectClass,
          )}
        >
          {previewUrl ? (
            <Image
              alt={label}
              className="object-cover"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              src={previewUrl}
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
              No new image selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
