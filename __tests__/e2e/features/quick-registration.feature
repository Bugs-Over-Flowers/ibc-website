@wip
Feature: Quick Registration

  Background:
    Email sending is mocked

  @wip
  Scenario: Quick onsite registration
    Given The admin is on the check in page
    When I initiate a quick registration for a walk-in participant
    Then the registration should be created with "Onsite" payment method
    And the participant should appear in the check-in list

  @wip
  Scenario: Quick registration with multiple participants
    Given The admin is on the check in page
    When I initiate a quick registration for multiple walk-in participants
    Then all participants should be registered under one identifier
    And all participants should appear in the check-in list