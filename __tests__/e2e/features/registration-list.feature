Feature: Registration list

  @happy
  Scenario Outline: Show all registrations on the registrations tab
    Given I am an admin on the registration list page for an event with <count> registrations
    When I open the registrations tab
    Then I should see all payment proof status types
    And the registration list should show <count> total registrations

    # title-format: <count> registrations
    Examples:
      | count |
      |     5 |
      |    10 |
      |    15 |
      |    20 |

  @happy
  Scenario Outline: Handle payment proof status changes in the registration details
    Given I am an admin on the registration list page for an event
    And I navigate to the registration details page for a pending registration
    And I open the payment proof review dialog
    When I <action> the payment proof on the payment proof review dialog
    Then the registration status should change to <result>
    And I should see the <result> status on the registrations tab
    And I should see the verified registration count update to <update-count>

   # title-format: Handle <action>
   Examples:
     | action | result      | update-count |
     | Accept | Accepted    | 2            |
     | Reject | Rejected    | 1            |

  @happy
  Scenario Outline: Handle payment proof status changes through row actions
    Given I am an admin on the registration list page for an event
    When I open the row actions menu for a pending registration
    And I open the Review Payment Proof Modal
    And I <action> the payment proof on the payment proof review dialog
    Then the registration status should change to <result>
    And I should see the <result> status on the registrations tab
    And I should see the verified registration count update to <update-count>

    # title-format: Handle <action>
    Examples:
      | action | result   | update-count |
      | Accept | Accepted | 2            |
      | Reject | Rejected | 1            |

  @happy
  Scenario: Search registrations by affiliation
    Given I am an admin on the registration list page for an event
    When I search for the affiliation "pending"
    Then I should see the registration with affiliation "pending"
    And I should not see registrations with other affiliations

  @happy
  Scenario Outline: Filter registrations by payment status
    Given I am an admin on the registration list page for an event
    When I filter by <filter> payment status
    Then I should see only registrations with <badge> payment status

    # title-format: Filter by <filter>
    Examples:
      | filter   | badge     |
      | Accepted | accepted  |
      | Rejected | rejected  |
      | Pending  | pending   |

  @happy
  Scenario: Clear filters returns to full list
    Given I have pending registrations filters applied to the registration list
    Then I should see only pending registrations
    When I clear all filters
    Then I should see all registrations

  @happy
  Scenario: Stats stay consistent across tabs
    Given I am on the registration list page for an event
    When I switch between the registrations and participants tabs
    Then the stats at the top should remain the same

  @sad
  Scenario: Search with no matching results shows empty state
    Given I am an admin on the registration list page for an event
    When I search for "NonExistentSearchTerm12345"
    Then I should see a "no registrations found" message
