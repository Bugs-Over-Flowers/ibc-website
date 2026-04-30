@smoke
Feature: Registration flow

  Background:
    Email sending is mocked

  @smoke
  Scenario: Open registration from event details
    Given I am on an event details page
    When I click the "Register for This Event" button
    Then I should be redirected to the registration form

  @smoke
  Scenario: Block non-member registration for a private event
    Given I am on the registration form for a private event
    When I try to continue the registration
    Then I should see a message that the event is private

  @smoke
  Scenario Outline: Register as a member
    Given I am on the member registration form
    When I submit a valid member registration <note>
    Then I should see the member registration success result
    And I should be redirected back after member registration

	# title-format: <note>
    Examples:
      | note         |
      | with note    |
      | without note |

  @smoke
  Scenario Outline: Register as a non-member for a public event
    Given I am on the registration form for a public event
    When I submit a valid non-member registration <note>
    Then I should see the public non-member registration success result
    And I should be redirected back after public registration

	# title-format: <note>
    Examples:
      | note         |
      | with note    |
      | without note |

  @smoke
  Scenario: Register multiple participants
    Given I am on the multi-participant registration form
    When I submit a registration with multiple participants
    Then I should see the multiple participant registration success result
    And the registration should include all participants
