@featured-members @requires-submit
Feature: Featured member management
  As an admin
  I want to feature a member from the admin directory
  So that the member appears in the public featured section

  Background:
    Given seeded featured member data is available
    And I am on the admin members page

  Scenario: Admin can feature a member and show it on the public members page
    When I open the feature dialog for the seeded member
    And I set the featured expiration date to tomorrow
    And I save the featured member changes
    Then I should see the member marked as featured in the admin members list
    When I open the public members page
    Then I should see the seeded member in the featured members section

  # Additional happy paths
  Scenario: Feature a member with today's date
    When I open the feature dialog for the seeded member
    And I set the featured expiration date to today
    And I save the featured member changes
    Then I should see the member marked as featured in the admin members list

  Scenario: Feature a member for 7 days
    When I open the feature dialog for the seeded member
    And I set the featured expiration date to 7 days from today
    And I save the featured member changes
    Then I should see the member marked as featured in the admin members list

  # Sad paths
  Scenario: Prevent empty expiration date submission
    When I open the feature dialog for the seeded member
    And I submit the feature form without a date
    Then I should see a validation error for missing expiration date

  Scenario: Reject past expiration date
    When I open the feature dialog for the seeded member
    And I set the featured expiration date to yesterday
    And I save the featured member changes
    Then I should see a validation error for past expiration date

  Scenario: Cannot feature an already featured member
    Given the seeded member is already featured until tomorrow
    When I am on the admin members page
    Then I should see the member shown as already featured