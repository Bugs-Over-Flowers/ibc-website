Feature: Registration list

  @happy
  Scenario: Show all registrations on the registrations tab
    Given I am an admin on the registration list page for an event
    When I open the registrations tab
    Then I should see registrations with pending payment proof status
    And I should see registrations with rejected payment proof status
    And I should see registrations with accepted payment proof status

  @happy
  Scenario: Accept payment proof from the registration details page
    Given I am an admin on the registration list page for an event
    And I navigate to the registration details page for a pending registration
    When I accept the payment proof
    Then the registration status should change to "accepted"
    And I should see the updated status on the registrations tab
    And I should see the updated stats at the top

  @happy
  Scenario: Search registrations by affiliation
    Given I am an admin on the registration list page for an event
    When I search for the affiliation "pending"
    Then I should see the registration with affiliation "pending"
    And I should not see registrations with other affiliations

  @happy
  Scenario: Clear filters returns to full list
    Given I have pending registrations filters applied to the registration list
    Then I should see only pending registrations
    When I clear all filters
    Then I should see all registrations

  @happy
  Scenario: Accept payment proof from the registrations tab
    Given I am an admin on the registration list page for an event
    When I open the row actions menu for a pending registration
    And I open the Review Payment Proof Modal
    And I accept the payment proof
    Then the registration status should change to "accepted"
    And I should see the updated status on the registrations tab
    And I should see the updated stats at the top

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
