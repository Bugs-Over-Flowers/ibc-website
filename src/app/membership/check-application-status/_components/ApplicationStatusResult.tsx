"use client";

import { format } from "date-fns";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  MapPin,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { ApplicationStatusResponse } from "@/lib/types/application";
import { cn } from "@/lib/utils";

const statusColors = {
  new: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  interview: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

interface ApplicationStatusResultProps {
  result: ApplicationStatusResponse;
}

export function ApplicationStatusResult({
  result,
}: ApplicationStatusResultProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy");
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
  };

  const getStatusBadge = () => {
    if (result.applicationStatus === "rejected") {
      return { label: "Rejected", color: statusColors.rejected };
    }
    if (result.applicationStatus === "approved") {
      return { label: "Approved", color: statusColors.approved };
    }
    if (result.hasInterview) {
      return { label: "Interview Scheduled", color: statusColors.interview };
    }
    return {
      label: result.applicationStatus,
      color: statusColors[result.applicationStatus],
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-8">
      {/* Application Information Card */}
      <Card className="flex flex-col overflow-hidden border-white/5 bg-[#161e2e] p-0 shadow-2xl">
        <div className="border-white/5 border-b bg-[#1f2937]/50 p-6">
          <h3 className="flex items-center gap-3 font-semibold text-lg text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileText className="h-5 w-5" />
            </div>
            Application Details
          </h3>
        </div>
        <CardContent className="grid flex-1 gap-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="cursor-help">
                  <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#1f2937]/50 p-4 transition-colors hover:border-white/10 hover:bg-[#1f2937]/80">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-[#111827] text-cyan-400">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="font-medium text-slate-400 text-xs uppercase tracking-wider">
                        Company Name
                      </p>
                      <p className="mt-0.5 truncate font-semibold text-white text-xs">
                        {result.companyName}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{result.companyName}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger className="cursor-help">
                  <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#1f2937]/50 p-4 transition-colors hover:border-white/10 hover:bg-[#1f2937]/80">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-[#111827] text-cyan-400">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="font-medium text-slate-400 text-xs uppercase tracking-wider">
                        Application Date
                      </p>
                      <p className="mt-0.5 truncate font-semibold text-white text-xs">
                        {formatDate(result.applicationDate)}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatDate(result.applicationDate)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#1f2937]/50 p-4">
            <span className="flex items-center gap-2 font-medium text-slate-300 text-sm">
              <Info className="h-4 w-4 text-slate-400" />
              Current Status
            </span>
            <Badge
              className={cn(
                "px-3 py-1 font-bold text-xs uppercase tracking-wider shadow-sm",
                statusBadge.color,
              )}
              variant="outline"
            >
              {statusBadge.label}
            </Badge>
          </div>

          <div className="flex items-center justify-center text-slate-500">
            <p className="flex items-center gap-2 text-xxs">
              <Info className="h-3 w-3" />
              Hover over details to see full information
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Details Card */}
      {result.applicationStatus === "rejected" ? (
        <Card className="flex flex-col overflow-hidden border-white/5 bg-[#161e2e] p-0 shadow-2xl">
          <div className="border-white/5 border-b bg-[#1f2937]/50 p-6">
            <h3 className="flex items-center gap-3 font-semibold text-lg text-red-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <XCircle className="h-5 w-5" />
              </div>
              Application Rejected
            </h3>
          </div>
          <CardContent className="flex flex-1 flex-col justify-center p-6">
            <div className="h-full rounded-xl border border-red-500/10 bg-red-950/20 p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                  <Info className="h-5 w-5" />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-base text-red-400">
                      Application Not Approved
                    </h4>
                    <p className="text-red-200/70 text-sm leading-relaxed">
                      Unfortunately, your application for membership has not
                      been approved at this time. We appreciate your interest in
                      the Iloilo Business Club. You are welcome to review our
                      membership requirements and submit a new application.
                    </p>
                  </div>
                  <Link
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full border border-red-500/20 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:text-white",
                    )}
                    href="/membership/application"
                  >
                    Submit New Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : result.applicationStatus === "approved" ? (
        <Card className="flex flex-col overflow-hidden border-white/5 bg-[#161e2e] p-0 shadow-2xl">
          <div className="border-white/5 border-b bg-[#1f2937]/50 p-6">
            <h3 className="flex items-center gap-3 font-semibold text-emerald-400 text-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <BadgeCheck className="h-5 w-5" />
              </div>
              Membership Approved
            </h3>
          </div>
          <CardContent className="flex flex-1 flex-col justify-center p-6">
            <div className="h-full rounded-xl border border-emerald-500/10 bg-emerald-950/20 p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-base text-emerald-400">
                    Officially a Member
                  </h4>
                  <p className="text-emerald-200/70 text-sm leading-relaxed">
                    The company associated with this application has been
                    approved and is now an official member of the Iloilo
                    Business Club.
                  </p>
                  <div className="pt-2">
                    <p className="text-emerald-200/50 text-xs">
                      Welcome to the community!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : result.hasInterview && result.interview ? (
        <Card className="flex flex-col overflow-hidden border-white/5 bg-[#161e2e] p-0 shadow-2xl">
          <div className="border-white/5 border-b bg-[#1f2937]/50 p-6">
            <h3 className="flex items-center gap-3 font-semibold text-emerald-400 text-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              Interview Scheduled
            </h3>
          </div>
          <CardContent className="grid flex-1 gap-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#1f2937]/50 p-4 transition-colors hover:border-white/10 hover:bg-[#1f2937]/80">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-[#111827] text-emerald-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-400 text-xs uppercase tracking-wider">
                    Date & Time
                  </p>
                  <p className="mt-0.5 truncate font-semibold text-white">
                    {formatDateTime(result.interview.interviewDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-[#1f2937]/50 p-4 transition-colors hover:border-white/10 hover:bg-[#1f2937]/80">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-[#111827] text-emerald-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-400 text-xs uppercase tracking-wider">
                    Venue
                  </p>
                  <p className="mt-0.5 truncate font-semibold text-white">
                    {result.interview.interviewVenue}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/10 bg-emerald-950/20 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 text-emerald-400" />
                <div>
                  <h4 className="mb-1 font-semibold text-emerald-400 text-sm">
                    Important Reminder
                  </h4>
                  <p className="text-emerald-200/70 text-sm leading-relaxed">
                    You will receive an email confirmation with your interview
                    details. Please arrive at least 15 minutes before your
                    scheduled interview time.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col overflow-hidden border-white/5 bg-[#161e2e] p-0 shadow-2xl">
          <div className="border-white/5 border-b bg-[#1f2937]/50 p-6">
            <h3 className="flex items-center gap-3 font-semibold text-amber-400 text-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              Under Review
            </h3>
          </div>
          <CardContent className="flex flex-1 flex-col justify-center p-6">
            <div className="h-full rounded-xl border border-amber-500/10 bg-amber-950/20 p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                  <Info className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-400 text-base">
                    Awaiting Interview Schedule
                  </h4>
                  <p className="text-amber-200/70 text-sm leading-relaxed">
                    Your application is currently under review by the Iloilo
                    Business Club. An interview date and venue will be scheduled
                    shortly, and you will be notified via email once confirmed.
                    Thank you for your patience.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
