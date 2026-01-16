import RegistrationErrorComponent from "@/app/registration/[eventId]/_components/RegistrationErrorComponent";

describe("RegistrationErrorComponent", () => {
  it("renders with an error", () => {
    cy.mount(
      <RegistrationErrorComponent
        message={"An unexpected error occurred. Please try again later."}
      />,
    );
    cy.contains("An unexpected error occurred. Please try again later.").should(
      "be.visible",
    );
  });
});
