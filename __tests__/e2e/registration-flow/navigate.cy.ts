describe("Given I am on the events page", () => {
  describe("And an event exists", () => {
    describe("When I click on the event register now button", () => {
      it("Then I should be taken to the event registration info page", () => {
        cy.visit("/events");
        cy.get("[data-cy=event-card]")
          .children()
          .get("[data-cy=register-now-button]")
          .first()
          .click();
        cy.url().should("include", "/registration/");
        cy.url().should("include", "/info");
      });
    });
    describe("When I click on the event details button", () => {
      it("Then I should be taken to the event info / details page", () => {
        cy.visit("/events");
        cy.get("[data-cy=event-card]")
          .first()
          .find("[data-cy=event-details-button]")
          .click();
        cy.url().should("include", "/events/");
      });
    });
  });
  describe("And when an event does not exists", () => {
    describe("And the event Id is valid", () => {
      const validId = "123e4567-e89b-12d3-a456-426614174000"; // Example UUID format

      describe("When I try to visit its registration page and event details page", () => {
        it('Then visiting its registration page should show "Event Not Found" message', () => {
          cy.visit(`/registration/${validId}`, { failOnStatusCode: false });
          cy.contains("Event Not Found").should("be.visible");
        });

        it('Then visiting its event details page should show "Event Not Found" message', () => {
          cy.visit(`/events/${validId}`, { failOnStatusCode: false });
          cy.contains("Event Not Found").should("be.visible");
        });
      });
    });
    describe("And the event ID is invalid", () => {
      const sampleEventId = "non-existent-event"; // Example invalid ID

      describe("When I try to visit its registration page and event details page", () => {
        it('Then visiting its registration page should show "This event is invalid" message', () => {
          cy.visit(`/registration/${sampleEventId}`, {
            failOnStatusCode: false,
          });
          cy.contains("This event is invalid").should("be.visible");
        });

        it('Then visiting its event details page should show "Event Not Found" message', () => {
          cy.visit(`/events/${sampleEventId}`, { failOnStatusCode: false });
          cy.contains("Event Not Found").should("be.visible");
        });
      });
    });
  });
});
