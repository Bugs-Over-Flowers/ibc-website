Feature: Sector Management
  As an admin
  I want to create and manage sectors
  So that sectors stay organized and up to date

  @happy
  Scenario: Create a new sector from the create-sector page
    Given I am on the manage-sector page with seeded sectors
    When I navigate to the create-sector page
    And I create a new unique sector
    Then I should be redirected to the manage-sector page
    And I should see the newly created sector in the sector list

  @sad
  Scenario: Block create sector submission when name is empty
    Given I am on the create-sector page with seeded sectors
    When I submit the create-sector form without a name
    Then I should remain on the create-sector page
    And I should see a validation error for the sector name field

  @sad
  Scenario: Show error when creating a duplicate sector name
    Given I am on the create-sector page with seeded sectors
    When I create a sector using an existing seeded sector name
    Then I should see a duplicate sector error message
    And I should remain on the create-sector page

  @sad
  Scenario: Show empty state when search has no matching sectors
    Given I am on the manage-sector page with seeded sectors
    When I search sectors with a non-existent keyword
    Then I should see the no sectors found state
