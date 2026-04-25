@smoke
Feature: Participant list

  @smoke
  Scenario: Hide pending and rejected registrations
    Given I am an admin on the registration list page for an event
    When I open the participants tab
    Then I should not see participants from pending registrations
    And I should not see participants from rejected registrations

  @smoke
  Scenario: Show participants from accepted registrations
    Given I am an admin on the registration list page for an event
    When I open the participants tab
    Then I should see participants from accepted registrations

  Scenario: Accepted payment proof makes participant visible
    Given I have a pending registration with participants
    When I accept the payment proof from the registration details page
    And I open the participants tab
    Then the registration's participants should appear in the participant list
    And I should see the updated stats at the top

  Scenario: Stats stay consistent across tabs
    Given I am on the participants tab
    When I switch to the registrations tab
    Then the stats at the top should remain the same
