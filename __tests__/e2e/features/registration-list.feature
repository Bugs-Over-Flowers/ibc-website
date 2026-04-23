Feature: Registration list

  Scenario: Show all registrations on the registrations tab
    Given I am an admin on the registration list page for an event
    When I open the registrations tab
    Then I should see registrations with pending payment proof status
    And I should see registrations with rejected payment proof status
    And I should see registrations with accepted payment proof status

  Scenario: Accept payment proof from the registration details page
    Given I am on a registration details page for a pending registration
    When I accept the payment proof
    Then the registration status should change to "accepted"
    And I should see the updated status on the registrations tab
    And I should see the updated stats at the top

  Scenario: Accept payment proof from the registrations tab
    Given I am an admin on the registration list page for an event
    When I open the row actions menu for a pending registration
    And I open the registration details page
    And I accept the payment proof
    Then the registration status should change to "accepted"
    And I should see the updated status on the registrations tab
    And I should see the updated stats at the top

  Scenario: Stats stay consistent across tabs
    Given I am on the registration list page for an event
    When I switch between the registrations and participants tabs
    Then the stats at the top should remain the same
