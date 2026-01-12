import { StatsSkeleton } from "../../../src/app/admin/events/[eventId]/registration-list/_components/page-skeletons";

describe("<StatsSkeleton />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<StatsSkeleton />);
  });
});
