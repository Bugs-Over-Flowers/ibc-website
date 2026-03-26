import { Building2, Calendar, ChevronLeft, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      {/* Header Section - matches RegistrationPageContent */}
      <div className="bg-primary px-4 pt-8 pb-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Back button and status badge */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-48 rounded-full" />
          </div>

          {/* Event type badge */}
          <div className="mb-4 inline-flex items-center rounded-full bg-primary-foreground/20 px-3 py-1 font-medium text-sm backdrop-blur-sm">
            <Tag className="mr-2 h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Event title */}
          <h1 className="mb-4 font-extrabold text-4xl text-primary-foreground tracking-tight md:text-5xl">
            <Skeleton className="h-12 w-3/4 rounded" />
          </h1>

          {/* Event details - date and fee */}
          <div className="flex flex-wrap gap-6 font-medium text-primary-foreground/90">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 opacity-80" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 opacity-80" />
              <Skeleton className="h-5 w-56" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Card Section - matches RegistrationPageContent */}
      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/50 bg-background p-6 pb-3 shadow-xl md:p-8 md:pb-4">
          {/* Stepper - matches Stepper component with 4 steps for registration */}
          <div className="mb-6 w-full px-0 sm:mb-8">
            <div className="relative flex items-center justify-between">
              <div className="absolute top-1/2 left-0 -z-10 h-1 w-full -translate-y-1/2 rounded-full bg-secondary" />
              <div className="absolute top-1/2 left-0 -z-10 h-1 w-0 -translate-y-1/2 rounded-full bg-primary transition-all duration-500" />

              {/* 4 Steps for registration: Member Type, Participants, Payment, Review */}
              {[1, 2, 3, 4].map((i) => (
                <div className="flex flex-col items-center" key={i}>
                  <Skeleton className="h-8 w-8 rounded-full sm:h-10 sm:w-10" />
                  <Skeleton className="mt-1 hidden h-3 w-16 rounded sm:mt-2 sm:block" />
                </div>
              ))}
            </div>
          </div>

          {/* Step Card - matches registration form structure */}
          <div className="mt-8">
            <div className="w-full overflow-hidden rounded-2xl bg-transparent shadow-none ring-0">
              {/* Card Header */}
              <div className="border-border/30 border-b bg-card/5 px-6 py-6 pb-4 sm:pb-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-lg" />
                  <Skeleton className="h-7 w-48" />
                </div>
                <Skeleton className="mt-2 h-4 w-80" />
              </div>

              {/* Card Content */}
              <div className="space-y-6 px-6 py-6">
                {/* Main form content skeletons */}
                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>

                {/* Additional form fields */}
                <div className="space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>

                {/* More form content */}
                <div className="space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Footer buttons */}
                <div className="mt-8 flex flex-col-reverse gap-3 border-border/50 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Skeleton className="h-10 w-full rounded-xl sm:w-auto sm:px-8" />
                  <Skeleton className="h-10 w-full rounded-xl shadow-md sm:w-auto sm:px-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
