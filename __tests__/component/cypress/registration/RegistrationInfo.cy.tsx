import { formatDate } from "date-fns";
import RegistrationInformation from "@/app/registration/[eventId]/_components/RegistrationInfoHeader";
import { mockEvent } from "../../../__fixtures__/events";

describe("Registration Header", () => {
  it("renders", () => {
    cy.mount(<RegistrationInformation {...mockEvent} />);

    // title should be visible
    cy.contains(mockEvent.eventTitle).should("be.visible");

    // date is readable
    if (mockEvent.eventStartDate) {
      const startDate = formatDate(
        new Date(mockEvent.eventStartDate),
        "iiii, MMMM dd, yyyy",
      );
      cy.contains(startDate).should("be.visible");
    }
  });
});
