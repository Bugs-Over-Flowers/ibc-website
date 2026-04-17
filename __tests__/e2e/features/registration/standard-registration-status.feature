@registration @status @requires-submit
Feature: Standard registration payment and affiliation persistence rules after submission

  @onsite @member
  Scenario: F1 onsite payment should be automatically accepted after submit
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "onsite" payment on step 3
    And I continue from step 3
    And I submit the registration on step 4
    Then the persisted registration payment proof status should be "accepted"

  @onsite @member
  Scenario: F2 onsite payment should not persist a proof image record
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "onsite" payment on step 3
    And I continue from step 3
    And I submit the registration on step 4
    Then the persisted registration should not have a proof image record

  @online @member
  Scenario: F3 online payment with proof should persist pending status and proof image
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "online" payment on step 3
    And I upload a payment proof image
    And I continue from step 3
    And I submit the registration on step 4
    Then the persisted registration payment proof status should be "pending"
    And the persisted registration should have a proof image record

  @online @member
  Scenario: F4 online payment without proof should not reach submission
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "online" payment on step 3
    And I continue from step 3
    Then I should remain on step 3 payment
    And I should see the online payment proof required error

  @onsite @nonmember
  Scenario: F5 persisted affiliation should store exactly one affiliation field
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "non-member"
    And I select "onsite" payment on step 3
    And I continue from step 3
    And I submit the registration on step 4
    Then the persisted registration should have exactly one affiliation field populated
