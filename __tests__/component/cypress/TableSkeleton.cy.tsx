import { TableSkeleton } from "../../../src/app/admin/events/[eventId]/registration-list/_components/page-skeletons";

describe("<TableSkeleton />", () => {
  it("renders with 3 columns", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<TableSkeleton columns={3} />);

    cy.get("th").should("have.length", 3);
  });

  it("renders with 5 columns", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<TableSkeleton columns={5} />);

    cy.get("th").should("have.length", 5);
  });
});
