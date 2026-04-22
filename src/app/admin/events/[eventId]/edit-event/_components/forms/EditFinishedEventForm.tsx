"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EditEventFormInstance } from "./types";

type EditFinishedEventFormProps = {
  form: EditEventFormInstance;
  onCancel: () => void;
};

export default function EditFinishedEventForm({
  form,
  onCancel,
}: EditFinishedEventFormProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-8 px-2 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <h1 className="font-extrabold text-3xl text-foreground tracking-tight">
            Update Facebook Link
          </h1>
          <p className="mt-2 max-w-3xl font-medium text-foreground/90 text-md leading-relaxed">
            This event has finished. Only the Facebook recap link can be
            updated.
          </p>
        </div>

        <Card className="gap-3 overflow-hidden rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="border-border/50 border-b pb-5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Info className="h-5 w-5 text-primary" />
              Event Details
            </CardTitle>
            <CardDescription>
              Keep the event page updated with the official recap link.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pb-5 sm:px-6 sm:py-2">
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
      </div>

      <div className="space-y-4 xl:sticky xl:top-[72px]">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-bold text-sm uppercase tracking-widest">
              Publishing
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form.Subscribe
              selector={(state) => ({
                isDirty: state.isDirty,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ isDirty, isSubmitting }) => (
                <div className="space-y-2">
                  <Button
                    className="w-full gap-2 rounded-xl text-sm"
                    disabled={isSubmitting}
                    onClick={onCancel}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="w-full gap-2 rounded-xl text-sm"
                    disabled={isSubmitting || !isDirty}
                    type="submit"
                  >
                    {isSubmitting ? "Saving..." : "Save Facebook Link"}
                  </Button>
                </div>
              )}
            </form.Subscribe>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
