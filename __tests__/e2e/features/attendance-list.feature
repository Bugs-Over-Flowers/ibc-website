Feature: Attendance List

  Background:
    Given I am on the attendance list page for the seeded event

  @happy
  Scenario: View attendance list with check-ins
    Then I should see the event title heading
    And I should see the event day tabs
    And I should see the check-in stats showing:
      | label                 | value    |
      | Expected participants | 10       |
      | Checked in - Day 1    | 10       |
      | Attendance rate       | 100%     |
    And I should see the attendance table with 10 participants
    And the first row should show check-in time in format "h:mm AM/PM"
    And the table should contain the participant details columns

  @happy
  Scenario: Navigate between event day tabs
    Given I am on the "Day 1" tab
    Then I should see 10 participants checked in
    And the stats should show "10" checked in for "Day 1"
    When I click on the "Day 2" tab
    Then I should see 0 participants checked in
    And the stats should show "0" checked in for "Day 2"

  @happy
  Scenario: Stats update correctly when switching tabs
    Given I am on the "Day 1" tab
    Then the stats should show correct percentages for Day 1
    When I click on the "Day 2" tab
    Then the stats should update to show "Day 2" in labels
    And the attendance rate should reflect 0% for Day 2

  @happy
  Scenario: Export check-in list to Excel
    Given I am on the "Day 1" tab
    When I click the Export to Excel button
    Then I should download an Excel file
    And the Excel file should contain the check-in data with columns:
      | Time        |
      | Identifier  |
      | First Name  |
      | Last Name   |
      | Affiliation |
      | Email       |
      | Contact     |
      | Remarks     |
    And the Excel file should have 11 rows including header
    And the Excel data should match the displayed check-in records

  @happy
  Scenario: View participant remarks
    Given there are participants with remarks
    When I click the "View" button for a participant with remarks
    Then I should see the remarks dialog
    And the dialog should show the participant's name
    And the dialog should show the remark text

  @happy
  Scenario Outline: View attendance list with various check-in rates
    Given I am on the attendance list page with <checkInCount> of <totalCount> participants checked in
    Then I should see the check-in stats showing:
      | label                 | value                 |
      | Expected participants | <totalCount>          |
      | Checked in - Day 1    | <checkInCount>        |
      | Attendance rate       | <expectedPercentage>% |
    And I should see the attendance table with <checkInCount> participants

	# title-format: <checkInCount> of <totalCount> participants checked in with <expectedPercentage>% attendance rate
    Examples:
      | checkInCount | totalCount | expectedPercentage |
      | 1            | 6          | 17                 |
      | 0            | 10         | 0                  |
      | 5            | 10         | 50                 |
      | 10           | 10         | 100                |
      | 20           | 20         | 100                |
      | 23           | 30         | 77                 |

  @sad
  Scenario: Show error when event does not exist
    Given I navigate to non-existent event attendance page
    Then I should see the attendance event not found error
