import { z } from "zod";

export const eventTitleSchema = z
  .string()
  .min(5, "Title must be at least 5 characters");

export const eventStartDateSchema = z.date({
  message: "Event start date is required",
});

export const eventEndDateSchema = z.date({
  message: "Event end date is required",
});

export const venueSchema = z
  .string()
  .min(5, "Venue must be at least 5 characters");

export const descriptionSchema = z.string();

export const eventDateRangeRefinementOptions = {
  message: "Event end date must be after start date",
  path: ["eventEndDate"],
};

export const eventDateRangeRefinement = (data: {
  eventStartDate: Date | string;
  eventEndDate?: Date | string | null;
}) => {
  if (!data.eventEndDate) return true;

  const startDate = new Date(data.eventStartDate);
  const endDate = new Date(data.eventEndDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return false;
  }

  return endDate >= startDate;
};

export const facebookLinkClientSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  return val;
}, z.string().url("Please enter a valid URL").optional());

export const facebookLinkServerSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed === "" ? null : trimmed;
  }
  return val;
}, z.string().url("Please enter a valid URL").nullable().optional());
