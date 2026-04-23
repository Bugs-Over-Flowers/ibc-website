Feature: Check-in list

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

  Scenario: Check in selected participants and update remarks
    Given I am on the accepted registration check-in dialog
    When I open the remark editor for the first participant
    And I add a remark for the first participant
    And I select the first and second participants
    Then I should see the check-in action for 2 selected participants
    When I check them in
    Then the database should contain the checked-in participants with the remark saved
    When I reopen the accepted registration check-in dialog
    And I open the remark editor for the first participant
    And I edit the first participant remark
    And I apply the remark update
    Then the database should reflect the updated remark
