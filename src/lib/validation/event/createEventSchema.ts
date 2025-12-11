import z from "zod";

const createEventSchema = z
  .object({
    eventTitle: z.string().min(5, "Title must atleast be 5 characters"),
    description: z.string(),
    eventStartDate: z
      .string()
      .pipe(z.coerce.date({ message: "Event start date is required" })),
    eventEndDate: z
      .string()
      .pipe(z.coerce.date({ message: "event end date is required" })),
    venue: z.string().min(5, "Venue must atleast be 5 characters"),
    registrationFee: z.number().min(0, "Must atleast be atleast 0"),
    eventType: z.enum(["public", "private"]).nullable(),
    eventImage: z
      .array(z.instanceof(File))
      .min(1, "At least 1 image is required"),
  })
  .refine((data) => data.eventEndDate >= data.eventStartDate, {
    message: "Event end date must be after start date",
    path: ["eventEndDate"],
  });

export default createEventSchema;
