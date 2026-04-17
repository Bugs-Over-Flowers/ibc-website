"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-0">
      <Button
        className="mb-2"
        onClick={() => router.push("/admin/events")}
        type="button"
        variant="ghost"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to events
      </Button>
      <h2 className="mt-8 mb-2 font-bold text-2xl">Create New Event</h2>
      <p className="mb-6 text-lg">Fill in the details to create a new event.</p>

      <div className="min-h-screen rounded-lg">
        <formContext.Provider value={form}>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.AppField name="eventTitle">
              {(field) => (
                <field.TextField
                  label={
                    <span>
                      Event Title <span className="text-destructive">*</span>
                    </span>
                  }
                  placeholder="Enter event title "
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
              {(field) => <field.NumberField label="Registration Fee * " />}
            </form.AppField>

            <form.AppField name="facebookLink">
              {(field) => (
                <field.TextField
                  label="Facebook Event Link"
                  placeholder="https://www.facebook.com/events/..."
                />
              )}
            </form.AppField>

            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-5 sm:items-stretch">
                <div className="col-span-1 flex h-full flex-col sm:col-span-3">
                  <form.AppField name="eventImage">
                    {(field) => (
                      <field.FileDropzoneField
                        accept={{
                          "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
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
                          "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
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
            </div>

            <div className="flex justify-end gap-4">
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <>
                    <Button
                      disabled={isSubmitting}
                      onClick={() => router.push("/admin/events")}
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
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
                          <Button disabled={isSubmitting} type="submit">
                            Save and Publish
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        }
                      />
                      <PopoverContent align="end" className="w-56 p-2">
                        <div className="flex flex-col gap-1">
                          <Button
                            className="justify-start"
                            onClick={() => {
                              form.setFieldValue("eventType", "public");
                              form.handleSubmit();
                            }}
                            type="button"
                            variant="ghost"
                          >
                            Save and Publish as Public
                          </Button>
                          <Button
                            className="justify-start"
                            onClick={() => {
                              form.setFieldValue("eventType", "private");
                              form.handleSubmit();
                            }}
                            type="button"
                            variant="ghost"
                          >
                            Save and Publish as Private
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                )}
              </form.Subscribe>
            </div>
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
