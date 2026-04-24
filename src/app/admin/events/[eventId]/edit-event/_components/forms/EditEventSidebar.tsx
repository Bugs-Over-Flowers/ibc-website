"use client";

import { ChevronDown, Globe, Lock, Save, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { EditEventFormInstance } from "./types";

type EditEventSidebarProps = {
  form: EditEventFormInstance;
  isDraft: boolean;
  isPrivatePublished: boolean;
  onCancel: () => void;
};

export default function EditEventSidebar({
  form,
  isDraft,
  isPrivatePublished,
  onCancel,
}: EditEventSidebarProps) {
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
                {isDraft ? (
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
                ) : (
                  <Badge variant="outline">
                    {isPrivatePublished ? "Private" : "Public"}
                  </Badge>
                )}
              </div>
            )}
          </form.Subscribe>

          <form.Subscribe
            selector={(state) => ({
              isSubmitting: state.isSubmitting,
              isDirty: state.isDirty,
            })}
          >
            {({ isSubmitting, isDirty }) => (
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

                {isDraft ? (
                  <>
                    <Button
                      className="w-full gap-2 rounded-xl text-sm"
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
                      <Save className="h-4 w-4" />
                      Save as Draft
                    </Button>

                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            className="w-full gap-2 rounded-xl text-sm"
                            disabled={isSubmitting}
                          >
                            <Send className="h-4 w-4" />
                            {isSubmitting ? "Saving..." : "Publish Event"}
                            <ChevronDown className="ml-1 h-4 w-4" />
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
                    {isPrivatePublished ? (
                      <Button
                        className="w-full gap-2 rounded-xl text-sm"
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
                    ) : null}

                    <Button
                      className="w-full gap-2 rounded-xl text-sm"
                      disabled={isSubmitting || !isDirty}
                      type="submit"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                )}
              </div>
            )}
          </form.Subscribe>
        </CardContent>
      </Card>
    </div>
  );
}
