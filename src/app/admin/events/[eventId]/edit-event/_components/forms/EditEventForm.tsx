"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formContext } from "@/hooks/_formHooks";
import type { Database } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { useEditEventForm } from "../../_hooks/useEditEventForm";

type EventRow = Database["public"]["Tables"]["Event"]["Row"];

interface EditEventFormProps {
  event: EventRow;
}

export function EditEventForm({ event }: EditEventFormProps) {
  const { form, router, isDraft, isFinished, isPrivatePublished } =
    useEditEventForm({ event });

  // Finished events can only edit the Facebook link
  if (isFinished && !isDraft) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-0">
        <button
          className="text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/admin/events/${event.eventId}`)}
          type="button"
        >
          ← Back to event
        </button>

        <div className="mt-12 text-center">
          <h2 className="font-bold text-2xl">Update Facebook Link</h2>
          <p className="mt-2 text-muted-foreground">
            This event has finished. Only the Facebook recap link can be
            updated.
          </p>
        </div>

        <formContext.Provider value={form}>
          <form
            className="mt-10 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.AppField name="facebookLink">
              {(field) => (
                <field.TextField
                  label="Facebook Link"
                  placeholder="https://www.facebook.com/your-event"
                  type="url"
                />
              )}
            </form.AppField>

            <form.Subscribe
              selector={(state) => ({
                isDirty: state.isDirty,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ isDirty, isSubmitting }) => (
                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    onClick={() =>
                      router.push(`/admin/events/${event.eventId}`)
                    }
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isSubmitting || !isDirty}
                    type="submit"
                  >
                    {isSubmitting ? "Saving..." : "Save Facebook Link"}
                  </Button>
                </div>
              )}
            </form.Subscribe>
          </form>
        </formContext.Provider>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        className="text-muted-foreground hover:text-foreground"
        onClick={() => router.push(`/admin/events/${event.eventId}`)}
        type="button"
      >
        ← Back to event
      </button>

      <h2 className="mt-12 mb-2 font-bold text-2xl">Edit Event</h2>
      <p className="mb-6 text-lg text-muted-foreground">
        {isDraft
          ? "This is a draft event. All fields are editable."
          : isPrivatePublished
            ? "This is a published private event. You can edit details and make it public."
            : "This is a published event. Only title, description, dates, venue, and image can be edited."}
      </p>

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.AppField name="eventStartDate">
                {(field) => (
                  <field.FormDateTimePicker label="Event Start Date *" />
                )}
              </form.AppField>

              <form.AppField name="eventEndDate">
                {(field) => (
                  <field.FormDateTimePicker label="Event End Date *" />
                )}
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

            {isDraft && (
              <form.AppField name="registrationFee">
                {(field) => <field.NumberField label="Registration Fee *" />}
              </form.AppField>
            )}

            {!isDraft && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Registration Fee</p>
                <p className="text-muted-foreground">
                  ₱{event.registrationFee.toLocaleString()} (Cannot be edited
                  for published events)
                </p>
              </div>
            )}

            <form.AppField name="facebookLink">
              {(field) => (
                <field.TextField
                  label="Facebook Link"
                  placeholder="https://www.facebook.com/your-event"
                  type="url"
                />
              )}
            </form.AppField>

            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-5 sm:items-stretch">
                <div className="col-span-1 flex h-full flex-col gap-2 sm:col-span-3">
                  <p className="font-medium text-sm">Current Event Header</p>
                  <div className="relative aspect-video w-full flex-1 overflow-hidden rounded-lg border bg-muted/20 sm:aspect-auto sm:h-full sm:min-h-[280px]">
                    {event.eventHeaderUrl ? (
                      <Image
                        alt="Current event header image"
                        className="object-cover"
                        fill
                        src={event.eventHeaderUrl}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                        No image uploaded yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-1 flex h-full flex-col gap-2 sm:col-span-2">
                  <p className="font-medium text-sm">Current Event Poster</p>
                  <div className="flex w-full flex-1 items-center justify-center">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted/20 sm:aspect-auto sm:h-full sm:min-h-[280px]">
                      {event.eventPoster ? (
                        <Image
                          alt="Current event poster"
                          className="object-cover"
                          fill
                          sizes="(min-width: 640px) 40vw, 100vw"
                          src={event.eventPoster}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                          No poster uploaded yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

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

            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
              <form.Subscribe
                selector={(state) => ({
                  isSubmitting: state.isSubmitting,
                  isDirty: state.isDirty,
                })}
              >
                {({ isSubmitting, isDirty }) => (
                  <>
                    <Button
                      className="w-full sm:w-auto"
                      disabled={isSubmitting}
                      onClick={() =>
                        router.push(`/admin/events/${event.eventId}`)
                      }
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>

                    {isDraft ? (
                      <>
                        <Button
                          className="w-full sm:w-auto"
                          disabled={isSubmitting || !isDirty}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
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
                                {isSubmitting ? "Saving..." : "Publish Event"}
                                <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            }
                          />

                          <PopoverContent align="end" className="w-40 p-0">
                            <div className="flex flex-col">
                              <Button
                                className="justify-start rounded-none"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  form.setFieldValue("eventType", "public");
                                  form.handleSubmit();
                                }}
                                variant="ghost"
                              >
                                Public Event
                              </Button>
                              <Button
                                className="justify-start rounded-none"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
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
                      </>
                    ) : (
                      <>
                        {isPrivatePublished && (
                          <Button
                            className="w-full sm:w-auto"
                            disabled={isSubmitting}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              form.setFieldValue("eventType", "public");
                              form.handleSubmit();
                            }}
                            type="button"
                          >
                            {isSubmitting ? "Saving..." : "Make Public"}
                          </Button>
                        )}

                        <Button
                          className="w-full sm:w-auto"
                          disabled={isSubmitting || !isDirty}
                          type="submit"
                        >
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                      </>
                    )}
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
