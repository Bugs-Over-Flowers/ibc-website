import NotReadyEvent from "@/app/registration/[eventId]/_components/NotReadyEvent";

describe("NotReadyEvent Component", () => {
  it("renders with title", () => {
    const testTitle = "Sample Event Title";
    cy.mount(<NotReadyEvent title={testTitle} />);
    cy.contains(testTitle).should("be.visible");
    cy.contains(
      "This event is not ready for registration yet. Please check back later.",
    ).should("be.visible");
  });
});
