import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";
import { getAllEvaluationsRpc } from "@/server/evaluation/queries/getAllEvaluations";
import { getAllSponsoredRegistrationsWithEvent } from "@/server/sponsored-registrations/queries/getAllSponsoredRegistrations";

type ActivityType = "application" | "member" | "event";

export type DashboardActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  date: string;
  href: string;
};

export type DashboardData = {
  generatedAt: string;
  health: {
    status: "healthy";
    lastSyncTime: string;
  };
  applications: {
    totalNewApplications: number;
    pendingInterviews: number;
    approvedMembers: number;
    rejectionRate: number;
    pendingRejections: number;
  };
  members: {
    totalActiveMembers: number;
    totalInactiveOrExpiredMembers: number;
    membersBySector: Array<{ sectorName: string; count: number }>;
    memberGrowthLast30Days: number;
    growthVsPrevious30Days: number;
  };
  events: {
    upcomingEventsNext7Days: number;
    totalRegistrationsAcrossActiveEvents: number;
    attendedParticipants: number;
    totalParticipants: number;
    attendanceRate: number;
    eventsWithLowRegistration: number;
  };
  sponsoredRegistrations: {
    activeSponsoredLinks: number;
    usageRate: number;
    topPerformingLinks: Array<{
      sponsoredRegistrationId: string;
      label: string;
      usedCount: number;
      maxSponsoredGuests: number | null;
      conversionRate: number;
    }>;
  };
  evaluations: {
    pendingEvaluations: number;
    averageSatisfactionScore: number;
    recentEvaluationCount: number;
  };
  recentActivity: DashboardActivityItem[];
};

const RATING_TO_SCORE: Record<string, number> = {
  poor: 1,
  fair: 2,
  good: 3,
  veryGood: 4,
  excellent: 5,
};

function calculateRate(value: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
}

function getTopSectorCounts(
  members: Array<{ Sector: { sectorName: string } | null }>,
): Array<{ sectorName: string; count: number }> {
  const sectorMap = new Map<string, number>();

  for (const member of members) {
    const sectorName = member.Sector?.sectorName ?? "Uncategorized";
    sectorMap.set(sectorName, (sectorMap.get(sectorName) ?? 0) + 1);
  }

  return [...sectorMap.entries()]
    .map(([sectorName, count]) => ({ sectorName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export async function getDashboardData(
  requestCookies: RequestCookie[],
): Promise<DashboardData> {
  "use cache";
  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.applications.admin);
  cacheTag(CACHE_TAGS.members.admin);
  cacheTag(CACHE_TAGS.events.admin);
  cacheTag(CACHE_TAGS.registrations.stats);
  cacheTag(CACHE_TAGS.evaluations.admin);

  const supabase = await createClient(requestCookies);

  const now = new Date();
  const nowIso = now.toISOString();

  const last30Days = new Date(now);
  last30Days.setDate(last30Days.getDate() - 30);

  const previous30DaysStart = new Date(now);
  previous30DaysStart.setDate(previous30DaysStart.getDate() - 60);

  const next7Days = new Date(now);
  next7Days.setDate(next7Days.getDate() + 7);

  const [
    applicationsRes,
    membersRes,
    activeEventsRes,
    upcomingEventsRes,
    evaluations,
    sponsoredRegistrations,
  ] = await Promise.all([
    supabase
      .from("Application")
      .select(
        "applicationId, companyName, applicationStatus, applicationDate, interviewId",
      ),
    supabase
      .from("BusinessMember")
      .select(
        "businessMemberId, businessName, joinDate, membershipStatus, membershipExpiryDate, Sector(sectorName)",
      ),
    supabase
      .from("Event")
      .select("eventId, eventTitle, eventStartDate, eventEndDate")
      .not("publishedAt", "is", null)
      .or(`eventEndDate.gte.${nowIso},eventEndDate.is.null`),
    supabase
      .from("Event")
      .select("eventId")
      .not("publishedAt", "is", null)
      .not("eventStartDate", "is", null)
      .gte("eventStartDate", nowIso)
      .lte("eventStartDate", next7Days.toISOString()),
    getAllEvaluationsRpc(requestCookies),
    getAllSponsoredRegistrationsWithEvent(requestCookies),
  ]);

  if (applicationsRes.error) {
    throw new Error(
      `Failed to fetch applications: ${applicationsRes.error.message}`,
    );
  }

  if (membersRes.error) {
    throw new Error(`Failed to fetch members: ${membersRes.error.message}`);
  }

  if (activeEventsRes.error) {
    throw new Error(
      `Failed to fetch active events: ${activeEventsRes.error.message}`,
    );
  }

  if (upcomingEventsRes.error) {
    throw new Error(
      `Failed to fetch upcoming events: ${upcomingEventsRes.error.message}`,
    );
  }

  const applications = applicationsRes.data ?? [];
  const members = (membersRes.data ?? []) as Array<{
    businessMemberId: string;
    businessName: string;
    joinDate: string;
    membershipStatus: string | null;
    membershipExpiryDate: string | null;
    Sector: { sectorName: string } | null;
  }>;
  const activeEvents = activeEventsRes.data ?? [];
  const activeEventIds = activeEvents.map((event) => event.eventId);

  const [registrationsRes, participantsRes, checkInsRes, pastEventsRes] =
    activeEventIds.length > 0
      ? await Promise.all([
          supabase
            .from("Registration")
            .select("registrationId, eventId")
            .in("eventId", activeEventIds),
          supabase
            .from("Participant")
            .select("participantId, Registration!inner(eventId)")
            .in("Registration.eventId", activeEventIds),
          supabase
            .from("CheckIn")
            .select("participantId, EventDay!inner(eventId)")
            .in("EventDay.eventId", activeEventIds),
          supabase
            .from("Event")
            .select("eventId")
            .not("publishedAt", "is", null)
            .not("eventEndDate", "is", null)
            .lt("eventEndDate", nowIso),
        ])
      : await Promise.all([
          Promise.resolve({ data: [], error: null }),
          Promise.resolve({ data: [], error: null }),
          Promise.resolve({ data: [], error: null }),
          supabase
            .from("Event")
            .select("eventId")
            .not("publishedAt", "is", null)
            .not("eventEndDate", "is", null)
            .lt("eventEndDate", nowIso),
        ]);

  if (registrationsRes.error) {
    throw new Error(
      `Failed to fetch registrations: ${registrationsRes.error.message}`,
    );
  }
  if (participantsRes.error) {
    throw new Error(
      `Failed to fetch participants: ${participantsRes.error.message}`,
    );
  }
  if (checkInsRes.error) {
    throw new Error(`Failed to fetch check-ins: ${checkInsRes.error.message}`);
  }
  if (pastEventsRes.error) {
    throw new Error(
      `Failed to fetch past events: ${pastEventsRes.error.message}`,
    );
  }

  const registrations = registrationsRes.data ?? [];
  const participants = participantsRes.data ?? [];
  const checkIns = checkInsRes.data ?? [];

  const registrationsByEvent = new Map<string, number>();
  for (const registration of registrations) {
    registrationsByEvent.set(
      registration.eventId,
      (registrationsByEvent.get(registration.eventId) ?? 0) + 1,
    );
  }

  const lowRegistrationEvents = activeEvents.filter((event) => {
    const registrationsCount = registrationsByEvent.get(event.eventId) ?? 0;
    return registrationsCount < 10;
  }).length;

  const pendingInterviews = applications.filter(
    (application) =>
      (application.applicationStatus === "new" ||
        application.applicationStatus === "pending") &&
      !application.interviewId,
  ).length;

  const totalNewApplications = applications.filter(
    (application) => application.applicationStatus === "new",
  ).length;

  const approvedMembers = applications.filter(
    (application) => application.applicationStatus === "approved",
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.applicationStatus === "rejected",
  ).length;

  const pendingRejections = applications.filter(
    (application) => application.applicationStatus === "pending",
  ).length;

  const totalApplications = applications.length;
  const rejectionRate = calculateRate(rejectedCount, totalApplications);

  const totalActiveMembers = members.filter(
    (member) => member.membershipStatus === "paid",
  ).length;

  const totalInactiveOrExpiredMembers = members.filter((member) => {
    const isStatusInactive = member.membershipStatus !== "paid";
    const isExpired =
      !!member.membershipExpiryDate &&
      new Date(member.membershipExpiryDate).getTime() < now.getTime();
    return isStatusInactive || isExpired;
  }).length;

  const memberGrowthLast30Days = members.filter((member) => {
    const joinedAt = new Date(member.joinDate);
    return (
      member.membershipStatus === "paid" &&
      joinedAt >= last30Days &&
      joinedAt <= now
    );
  }).length;

  const previous30DayGrowth = members.filter((member) => {
    const joinedAt = new Date(member.joinDate);
    return (
      member.membershipStatus === "paid" &&
      joinedAt >= previous30DaysStart &&
      joinedAt < last30Days
    );
  }).length;

  const growthVsPrevious30Days =
    previous30DayGrowth > 0
      ? Number(
          (
            ((memberGrowthLast30Days - previous30DayGrowth) /
              previous30DayGrowth) *
            100
          ).toFixed(1),
        )
      : memberGrowthLast30Days > 0
        ? 100
        : 0;

  const totalParticipants = participants.length;
  const attendedParticipants = new Set(
    checkIns.map((checkIn) => checkIn.participantId),
  ).size;
  const attendanceRate = calculateRate(attendedParticipants, totalParticipants);

  const activeSponsoredLinks = sponsoredRegistrations.filter(
    (row) => row.status === "active",
  ).length;

  const sponsoredUsageTotals = sponsoredRegistrations.reduce(
    (acc, row) => {
      const maxGuests = row.maxSponsoredGuests ?? 0;
      if (maxGuests > 0) {
        acc.max += maxGuests;
        acc.used += row.usedCount;
      }
      return acc;
    },
    { used: 0, max: 0 },
  );

  const usageRate = calculateRate(
    sponsoredUsageTotals.used,
    sponsoredUsageTotals.max,
  );

  const topPerformingLinks = [...sponsoredRegistrations]
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, 3)
    .map((row) => ({
      sponsoredRegistrationId: row.sponsoredRegistrationId,
      label: row.eventTitle || row.eventName || "Sponsored Registration",
      usedCount: row.usedCount,
      maxSponsoredGuests: row.maxSponsoredGuests,
      conversionRate: calculateRate(row.usedCount, row.maxSponsoredGuests ?? 0),
    }));

  const recentThreshold = new Date(now);
  recentThreshold.setDate(recentThreshold.getDate() - 7);

  const recentEvaluationCount = evaluations.filter(
    (evaluation) => new Date(evaluation.created_at) >= recentThreshold,
  ).length;

  const allScores = evaluations.flatMap((evaluation) => {
    const ratings = [
      evaluation.q1_rating,
      evaluation.q2_rating,
      evaluation.q3_rating,
      evaluation.q4_rating,
      evaluation.q5_rating,
      evaluation.q6_rating,
    ];

    return ratings
      .map((rating) => (rating ? RATING_TO_SCORE[rating] : undefined))
      .filter((rating): rating is number => typeof rating === "number");
  });

  const averageSatisfactionScore =
    allScores.length > 0
      ? Number(
          (
            allScores.reduce((sum, score) => sum + score, 0) / allScores.length
          ).toFixed(1),
        )
      : 0;

  const pastEventIds = (pastEventsRes.data ?? []).map((event) => event.eventId);
  const evalCountByEvent = evaluations.reduce((map, evaluation) => {
    if (!evaluation.event_id) return map;
    map.set(evaluation.event_id, (map.get(evaluation.event_id) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  const registrationsForPastEventsRes =
    pastEventIds.length > 0
      ? await supabase
          .from("Registration")
          .select("eventId")
          .in("eventId", pastEventIds)
      : { data: [], error: null };

  if (registrationsForPastEventsRes.error) {
    throw new Error(
      `Failed to fetch past event registrations: ${registrationsForPastEventsRes.error.message}`,
    );
  }

  const registrationCountByEvent = (
    registrationsForPastEventsRes.data ?? []
  ).reduce((map, row) => {
    map.set(row.eventId, (map.get(row.eventId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  const pendingEvaluations = pastEventIds.reduce((count, eventId) => {
    const registrationsCount = registrationCountByEvent.get(eventId) ?? 0;
    const evaluationsCount = evalCountByEvent.get(eventId) ?? 0;
    return count + Math.max(registrationsCount - evaluationsCount, 0);
  }, 0);

  const recentApplicationsActivity: DashboardActivityItem[] = applications
    .slice(0, 5)
    .map((application) => ({
      id: `application-${application.applicationId}`,
      type: "application",
      title: `Application: ${application.companyName}`,
      subtitle: `Status: ${application.applicationStatus}`,
      date: application.applicationDate,
      href: `/admin/application/${application.applicationId}`,
    }));

  const recentMembersActivity: DashboardActivityItem[] = [...members]
    .sort(
      (a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
    )
    .slice(0, 5)
    .map((member) => ({
      id: `member-${member.businessMemberId}`,
      type: "member",
      title: `New member: ${member.businessName}`,
      subtitle: `Sector: ${member.Sector?.sectorName ?? "Uncategorized"}`,
      date: member.joinDate,
      href: `/admin/members/${member.businessMemberId}`,
    }));

  const upcomingEventsActivity: DashboardActivityItem[] = [...activeEvents]
    .filter((event) => {
      if (!event.eventStartDate) return false;
      return new Date(event.eventStartDate) >= now;
    })
    .sort((a, b) => {
      const aDate = a.eventStartDate ? new Date(a.eventStartDate).getTime() : 0;
      const bDate = b.eventStartDate ? new Date(b.eventStartDate).getTime() : 0;
      return aDate - bDate;
    })
    .slice(0, 5)
    .map((event) => ({
      id: `event-${event.eventId}`,
      type: "event",
      title: `Upcoming event: ${event.eventTitle}`,
      subtitle: "Scheduled event",
      date: event.eventStartDate ?? nowIso,
      href: `/admin/events/${event.eventId}`,
    }));

  const recentActivity = [
    ...recentApplicationsActivity,
    ...recentMembersActivity,
    ...upcomingEventsActivity,
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    generatedAt: nowIso,
    health: {
      status: "healthy",
      lastSyncTime: nowIso,
    },
    applications: {
      totalNewApplications,
      pendingInterviews,
      approvedMembers,
      rejectionRate,
      pendingRejections,
    },
    members: {
      totalActiveMembers,
      totalInactiveOrExpiredMembers,
      membersBySector: getTopSectorCounts(members),
      memberGrowthLast30Days,
      growthVsPrevious30Days,
    },
    events: {
      upcomingEventsNext7Days: upcomingEventsRes.data?.length ?? 0,
      totalRegistrationsAcrossActiveEvents: registrations.length,
      attendedParticipants,
      totalParticipants,
      attendanceRate,
      eventsWithLowRegistration: lowRegistrationEvents,
    },
    sponsoredRegistrations: {
      activeSponsoredLinks,
      usageRate,
      topPerformingLinks,
    },
    evaluations: {
      pendingEvaluations,
      averageSatisfactionScore,
      recentEvaluationCount,
    },
    recentActivity,
  };
}

export async function searchDashboardActivity(
  requestCookies: RequestCookie[],
  query: string,
): Promise<DashboardActivityItem[]> {
  const dashboardData = await getDashboardData(requestCookies);
  const searchQuery = query.trim().toLowerCase();

  if (!searchQuery) {
    return dashboardData.recentActivity;
  }

  return dashboardData.recentActivity.filter((activity) => {
    const haystack =
      `${activity.title} ${activity.subtitle} ${activity.type}`.toLowerCase();
    return haystack.includes(searchQuery);
  });
}
