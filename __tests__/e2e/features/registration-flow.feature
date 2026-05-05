Feature: Registration flow

  Background:
    Email sending is mocked, Online payments are out of scope here.

  @happy
  Scenario: Open registration from event details
    Given I am on an event details page
    When I click the "Register for This Event" button
    Then I should be redirected to the registration form

  @sad
  Scenario: Block non-member registration for a private event
    Given I am on the registration form for a private event
    When I try to continue the registration
    Then I should see a message that the event is private

  @happy
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

  @happy
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

  @happy
  Scenario: Register with multiple participants
    Given I am on the multi-participant registration form
    When I submit a registration with multiple participants
    Then I should see the registration success result
    And the registration should include all participants

  @sad
  Scenario: Missing required fields shows errors
    Given I am on the registration form for a public event
    When I submit without filling required fields
    Then I should see the validation error "First name must be at least 2 characters"
    And I should see the validation error "Last name must be at least 2 characters"
    And I should see the validation error "Invalid email address"

  @critical @sad
  Scenario: Submit without accepting terms and conditions
    Given I am on the review registration page
    When I submit without accepting terms and conditions
    Then I should see "You must agree to the Terms and Conditions"

  @critical @sad
  Scenario: Organization selection failure
    Given I am on the member registration form
    When I try to select a non-existent organization
    Then I should see an error message about organization
