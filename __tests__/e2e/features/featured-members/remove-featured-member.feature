@remove-featured-member
Feature: Remove featured member
  As an admin
  I want to remove members from the featured list
  So that the public featured section stays current

  Background:
    Given seeded featured member data is available
    And the seeded member is already featured until tomorrow
    And I am on the admin members page

  Scenario: Show remove button for a featured member
    Then I should see the Remove from Featured button for the seeded member

  Scenario: Show confirmation dialog before removal
    When I click Remove from Featured for the seeded member
    Then I should see the confirmation dialog for removing the seeded member

  Scenario: Confirm removal updates the admin and public UI immediately
    When I click Remove from Featured for the seeded member
    And I confirm the removal
    Then I should see the member returned to a non-featured state in the admin members list
    When I open the public members page
    Then I should not see the seeded member in the featured members section

  Scenario: Cancel removal keeps the member featured
    When I click Remove from Featured for the seeded member
    And I cancel the removal
    Then I should still see the seeded member as featured in the admin members list