Feature: Registration Management

  Scenario: Registration Details Navigation
    Given I am seeing a row under the Registration List or the Participant List
    When I click on the actions button
    And I click on the Registration Details
    Then it should redirect me to the registration details page of that specific registration data or the registration of that participant

  Scenario: View Registration Details Content
    Given I am on the Registration Details page
    When the page loads
    Then I should see the General Information section (Event Name, Affiliation, Registration Identifier, Payment Method, and Note if there is one)
    And I should see the Participants list showing all individuals included in the registration
    And I should see the Payment Details card (Payment Method, Status, Image (for online), Actions)

  Scenario: View Registration Proof of Payment
    Given I am on the Registration Details page
    When the page loads
    Then I should see the Proof of Payment section (Payment Method, Status, Image (for online), Actions)

  Scenario: Accept Proof of Payment
    Given I am on the Registration Details page
    When I click on the Accept button
    Then the payment status should change to "Paid"
    And I should see a confirmation message
