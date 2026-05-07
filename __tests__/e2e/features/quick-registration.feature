Feature: Quick Registration

  Background:
    Email sending is mocked

  @happy
  Scenario: Quick onsite registration (non-member)
    Given The admin is on the check in page
    When I initiate a quick registration for a walk-in participant
    Then the registration should be created with "Onsite" payment method
    And the participant should appear in the check-in list

  @happy
  Scenario: Quick onsite registration (corporate member)
    Given The admin is on the check in page with seeded members
    When I initiate a quick registration for a member-affiliated walk-in participant
    Then the registration should be created with "Onsite" payment method

  @happy
  Scenario: Check in another after quick registration
    Given The admin is on the check in page
    When I initiate a quick registration and choose to check in another
    And I register another walk-in participant
    Then both registrations should appear in the check-in list

  @sad
  Scenario: Show validation errors for incomplete form
    Given The admin is on the check in page
    When I try to submit a blank quick registration form
    Then I should see validation errors for required fields
