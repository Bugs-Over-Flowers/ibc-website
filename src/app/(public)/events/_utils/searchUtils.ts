import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";

export type FilterOption = "all" | "upcoming" | "past";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export type DatePreset =
  | "custom"
  | "thisYear"
  | "last7Days"
  | "last14Days"
  | "last30Days"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter";

export const filterLabels: Record<FilterOption, string> = {
  all: "All Events",
  upcoming: "Upcoming",
  past: "Past Events",
};

export const datePresetLabels: Record<DatePreset, string> = {
  custom: "Custom",
  thisYear: "This Year",
  last7Days: "Last 7 Days",
  last14Days: "Last 14 Days",
  last30Days: "Last 30 Days",
  thisWeek: "This Week",
  lastWeek: "Last Week",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  thisQuarter: "This Quarter",
  lastQuarter: "Last Quarter",
};

export const getDateRangeFromPreset = (preset: DatePreset): DateRange => {
  const today = new Date();

  switch (preset) {
    case "thisYear":
      return { from: startOfYear(today), to: today };
    case "last7Days":
      return { from: subDays(today, 7), to: today };
    case "last14Days":
      return { from: subDays(today, 14), to: today };
    case "last30Days":
      return { from: subDays(today, 30), to: today };
    case "thisWeek":
      return { from: startOfWeek(today), to: endOfWeek(today) };
    case "lastWeek": {
      const lastWeekStart = startOfWeek(subDays(today, 7));
      return { from: lastWeekStart, to: endOfWeek(lastWeekStart) };
    }
    case "thisMonth":
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case "lastMonth": {
      const lastMonthStart = startOfMonth(subDays(startOfMonth(today), 1));
      return { from: lastMonthStart, to: endOfMonth(lastMonthStart) };
    }
    case "thisQuarter":
      return { from: startOfQuarter(today), to: endOfQuarter(today) };
    case "lastQuarter": {
      const lastQuarterStart = startOfQuarter(
        subDays(startOfQuarter(today), 1),
      );
      return { from: lastQuarterStart, to: endOfQuarter(lastQuarterStart) };
    }
    default:
      return { from: undefined, to: undefined };
  }
};
