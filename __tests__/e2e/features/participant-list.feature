Feature: Participant list

  @happy
  Scenario: Hide pending and rejected registrations
    Given I am an admin on the registration list page for an event
    When I open the participants tab
    Then I should not see participants from pending registrations
    And I should not see participants from rejected registrations

  @happy
  Scenario: Show participants from accepted registrations
    Given I am an admin on the registration list page for an event
    When I open the participants tab
    Then I should see participants from accepted registrations

  @happy
  Scenario Outline: Payment proof status changes affect participant visibility
    Given I have a pending registration with participants
    And I open the payment proof review dialog
    When I <action> the payment proof on the payment proof review dialog
    And I open the participants tab
    Then the registration's participants should <visibility> in the participant list
    And I should see the verified registration count update to <update-count>

    # title-format: <action> payment proof makes participants <visibility>
    Examples:
      | action | visibility | update-count |
      | Accept | appear     | 2            |
      | Reject | not appear | 1            |

  @happy
  Scenario: Stats stay consistent across tabs
    Given I am on the participants tab
    When I switch to the registrations tab
    Then the stats at the top should remain the same
