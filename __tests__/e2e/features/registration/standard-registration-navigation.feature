@registration @navigation
Feature: Standard registration navigation from events page to registration

  Background:
    Given seeded standard registration data is available
    And I am on the events page

  @no-submit @public-event
  Scenario: A1 user can navigate from events page to event details
    When I open the event details for the "public upcoming" event
    Then I should be on the event details page for the active event

  @no-submit @public-event
  Scenario: A2 user can open registration info from events list register now button
    When I start registration info for the "public upcoming" event from the events page
    Then I should be on the registration info page for the active event

  @no-submit @public-event
  Scenario: A3 user can open registration info from event details registration card
    When I open the event details for the "public upcoming" event
    And I open registration info from the active event details page
    Then I should be on the registration info page for the active event

  @no-submit @public-event
  Scenario: A4 user can continue from registration info page to registration form
    When I start registration info for the "public upcoming" event from the events page
    And I continue to the registration form from the info page
    Then I should be on the registration form page for the active event

  @no-submit @public-event
  Scenario: A5 back navigation works between registration form info and event pages
    When I start registration info for the "public upcoming" event from the events page
    And I continue to the registration form from the info page
    And I go back to the event details page from the registration form
    And I open registration info from the active event details page
    And I continue to the registration form from the info page
    And I go back to the registration info page from the registration form
    Then I should be on the registration info page for the active event

  @no-submit @past-event
  Scenario: A6 past event details page should not show registration CTA
    When I open the event details for the "past public" event
    Then I should not see a registration CTA on the event details page
