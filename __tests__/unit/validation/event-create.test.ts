import { describe, expect, it } from "vitest";
import {
  createEventSchema,
  draftEventServerSchema,
} from "@/lib/validation/event/createEventSchema";

const draftStartDate = new Date("2026-05-10T09:00:00.000Z");
const draftEndDate = new Date("2026-05-10T11:00:00.000Z");

describe("event draft validation", () => {
  it("accepts a minimal draft payload on the client schema", () => {
    const result = createEventSchema.safeParse({
      eventTitle: "Draft Event",
      eventStartDate: draftStartDate,
      eventEndDate: draftEndDate,
      eventType: null,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a minimal draft payload on the server schema", () => {
    const result = draftEventServerSchema.safeParse({
      eventTitle: "Draft Event",
      eventStartDate: draftStartDate,
      eventEndDate: draftEndDate,
      eventType: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a draft payload without the required title and dates", () => {
    const result = draftEventServerSchema.safeParse({
      eventType: null,
    });

    expect(result.success).toBe(false);
  });
});
