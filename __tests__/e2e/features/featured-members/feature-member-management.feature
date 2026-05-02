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