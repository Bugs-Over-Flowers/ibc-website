Feature: Create Event
  As an admin
  I want to create events via the admin UI
  So that events appear in the events list

  Scenario: Admin successfully creates a new public event
    Given I navigate to the admin create event page
    When I fill in the basic event details
    And I select dummy start and end dates
    And I upload dummy event images
    And I submit the event as "Public Event"
    Then I should be redirected to the admin events list

  Scenario: Admin creates a public event without images
    Given I navigate to the admin create event page
    When I fill in the basic event details
    And I select dummy start and end dates
    # skip image upload
    And I submit the event as "Public Event"
    Then I should be redirected to the admin events list

  Scenario: Admin creates a public event with zero fee
    Given I navigate to the admin create event page
    When I fill in the basic event details
    And I select dummy start and end dates
    And I upload dummy event images
    # adjust fee to zero (handled by step)
    When I set the registration fee to "0"
    And I submit the event as "Public Event"
    Then I should be redirected to the admin events list

  # Sad paths
  Scenario: Submit blocked when title is missing
    Given I navigate to the admin create event page
    When I fill in the basic event details
    And I clear the Event Title
    And I attempt to submit the event as "Public Event"
    Then I should remain on the create-event page
    And I should see a validation error for "Event Title"

  Scenario: Submit shows validation for invalid registration fee
    Given I navigate to the admin create event page
    When I fill in the basic event details
    And I enter an invalid registration fee
    And I attempt to submit the event as "Public Event"
    Then I should remain on the create-event page
    And I should see a validation error for "Registration Fee"

  Scenario: Submit blocked when dates are not selected
    Given I navigate to the admin create event page
    When I fill in the basic event details
    # do not select dates
    And I attempt to submit the event as "Public Event"
    Then I should remain on the create-event page
    And the Create Event button should be disabled
