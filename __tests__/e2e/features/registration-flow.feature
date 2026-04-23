Feature: Registration flow

  Background:
  	Email sending is mocked

  Scenario: Open registration from event details
    Given I am on an event details page
    When I click the "Register for This Event" button
    Then I should be redirected to the registration form

  Scenario: Register as a member
    Given I am on the registration form
    When I submit a valid member registration
    Then I should see a success result
    And I should be redirected back to the event details page

  Scenario: Register as a non-member for a public event
    Given I am on the registration form for a public event
    When I submit a valid non-member registration
    Then I should see a success result
    And I should be redirected back to the event details page

  Scenario: Block non-member registration for a private event
    Given I am on the registration form for a private event
    When I try to continue the registration
    Then I should see a message that the event is private

  Scenario: Register multiple participants
    Given I am on the registration form
    When I submit a registration with multiple participants
    Then I should see a success result
    And the registration should include all participants
