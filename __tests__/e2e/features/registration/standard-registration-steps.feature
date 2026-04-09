@registration
Feature: Standard registration form behavior through step 4 without submission

  @step1 @no-submit @public-event @member
  Scenario: B1 member affiliation requires selecting a company
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    And I should be on step 1 affiliation
    When I continue from step 1 without selecting a member company
    Then I should see the member affiliation validation error

  @step1 @no-submit @public-event @nonmember
  Scenario: B2 non-member affiliation requires entering an affiliation name
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    And I should be on step 1 affiliation
    When I continue from step 1 without entering non-member affiliation
    Then I should see the non-member affiliation validation error

  @step1 @no-submit @public-event
  Scenario: B3 switching member to non-member and back clears member selection
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    When I switch from member to non-member and back to member
    Then the member company selection should be cleared

  @step1 @no-submit @public-event
  Scenario: B4 switching non-member to member and back clears non-member affiliation
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    When I switch from non-member to member and back to non-member
    Then the non-member affiliation input should be cleared

  @step1 @no-submit @public-event
  Scenario: B5 public event should allow both member and non-member options
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    Then I should see both member and non-member options

  @step1 @no-submit @private-event
  Scenario: B6 private event should prevent non-member selection
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "private upcoming" event from the events page
    Then the non-member option should not be selectable

  @step1 @no-submit @public-event
  Scenario Outline: B7 affiliation behaves as XOR between member and non-member fields
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    When I select "<affiliation>" affiliation on step 1
    Then only the selected affiliation field should be visible

    Examples:
      | affiliation |
      | member      |
      | non-member  |

  @step2 @no-submit @public-event
  Scenario: C1 step 2 required participant fields block progression
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    And I complete step 1 as a "member"
    And I should land on step 2 participants
    When I continue from step 2 with empty participant fields
    Then I should see required participant field errors

  @step2 @no-submit @public-event
  Scenario: C2 invalid participant email and contact number block progression
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    And I complete step 1 as a "member"
    And I should land on step 2 participants
    When I enter invalid email and contact number for the registrant and continue
    Then I should see invalid email and contact number errors

  @step2 @no-submit @public-event
  Scenario: C3 participant addition should stop at 10 total participants
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    And I complete step 1 as a "member"
    And I should land on step 2 participants
    When I add all allowed additional participants
    Then the participant limit should be reached

  @step2 @no-submit @public-event
  Scenario: C4 duplicate participant identity should be rejected
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    And I complete step 1 as a "member"
    And I should land on step 2 participants
    When I add a duplicate participant with the same identity as the registrant
    Then the duplicate participant should be rejected

  @step2 @no-submit @public-event
  Scenario: C5 removing a participant updates participant count
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    And I complete step 1 as a "member"
    And I should land on step 2 participants
    When I remove the first additional participant
    Then the participant count should return to one

  @step3 @no-submit @onsite
  Scenario: D1 onsite payment allows progression to step 4 without payment proof
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "onsite" payment on step 3
    And I continue from step 3
    Then I should land on step 4 review

  @step3 @no-submit @online
  Scenario: D2 online payment displays upload proof section
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "online" payment on step 3
    Then I should see the payment proof upload section

  @step3 @no-submit @online
  Scenario: D3 online payment without proof blocks progression
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "online" payment on step 3
    And I continue from step 3
    Then I should remain on step 3 payment
    And I should see the online payment proof required error

  @step3 @no-submit @online
  Scenario: D4 online payment with proof allows progression to step 4
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "online" payment on step 3
    And I upload a payment proof image
    And I continue from step 3
    Then I should land on step 4 review

  @step3 @step4 @no-submit
  Scenario: D5 onsite payment summary should not show proof preview on step 4
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "onsite" payment on step 3
    And I continue from step 3
    Then the step 4 payment summary should show "onsite" payment
    And the step 4 payment proof preview should be hidden

  @step3 @step4 @no-submit
  Scenario: D5 online payment summary should show proof preview on step 4
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "online" payment on step 3
    And I upload a payment proof image
    And I continue from step 3
    Then the step 4 payment summary should show "online" payment
    And the step 4 payment proof preview should be visible

  @step4 @no-submit @member
  Scenario: E1 step 4 affiliation summary shows member company
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "onsite" payment on step 3
    And I continue from step 3
    Then the step 4 affiliation summary should show the seeded member company

  @step4 @no-submit @nonmember
  Scenario: E1 step 4 affiliation summary shows non-member company
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "non-member"
    And I select "onsite" payment on step 3
    And I continue from step 3
    Then the step 4 affiliation summary should show the non-member company

  @step4 @no-submit
  Scenario: E2 step 4 should compute participants and total amount correctly
    Given seeded standard registration data is available
    And I am on the events page
    And I open the registration form for the "public upcoming" event from the events page
    And I complete step 1 as a "member"
    When I complete step 2 with one additional participant
    And I select "onsite" payment on step 3
    And I continue from step 3
    Then step 4 should show 2 participants in the summary
    And step 4 should show total amount "1,000.00"

  @step4 @no-submit
  Scenario: E3 terms and conditions checkbox should be visible on step 4
    Given seeded standard registration data is available
    And I am on the events page
    When I open the registration form for the "public upcoming" event and complete steps 1 and 2 as "member"
    And I select "onsite" payment on step 3
    And I continue from step 3
    Then I should see the terms and conditions checkbox on step 4
