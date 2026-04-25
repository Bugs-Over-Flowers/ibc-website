@smoke
Feature: Check-in list

  @smoke
  Scenario: Load the check-in page
    Given I am on the seeded check-in page
    Then I should see the event day details card
    And I should see the QR scanner
    And I should see the quick onsite registration card
    And I should see the registration list
    And I should see payment status badges for pending, rejected, and accepted registrations

  Scenario: Show payment proof status displays
    Given I am on the pending registration check-in dialog
    Then I should see the pending payment notice
    When I open the rejected registration check-in dialog
    Then I should see the rejected payment notice
    When I open the accepted registration check-in dialog
    Then I should not see any payment status notice

  @smoke
  Scenario: Check in participants with remarks
    Given I am on the accepted registration check-in dialog
    When I open the remark editor for the first participant
    And I add a remark for the first participant
    And I select the first and second participants
    And I check them in
    Then the app should contain the checked-in participants with the remark saved
    When I reopen the accepted registration check-in dialog
    Then I should see the existing remark for the first participant

  @smoke
  Scenario: Update remarks after check-in
    Given I am on the accepted registration check-in dialog
    And I open the remark editor for the first participant
    And I verify there is no existing remark for the second participant
    When I edit the first participant remark
    And I apply the remark update
    Then the app should reflect the updated remark for the first participant

  Scenario Outline: Check in multiple participants
    Given I am on the accepted registration check-in dialog
    When I select the first <count> participants
    Then I should see the check-in action for <count> selected participants

    # title-format: <count> participants
    Examples:
      | count |
      |     1 |
      |     2 |
      |     5 |
      |    10 |