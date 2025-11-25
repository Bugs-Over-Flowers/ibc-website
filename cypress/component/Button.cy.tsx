import { Button } from "@/components/ui/button";

describe("Mount Button", () => {
  it("should render the Button component", () => {
    cy.mount(<Button>Hello, Cypress!</Button>);
    cy.get("button").contains("Hello, Cypress!");
  });
});
