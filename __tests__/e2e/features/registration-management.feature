Feature: Registration Management

  @critical @happy
  Scenario: Registration Details Navigation
    Given I am seeing a row under the Registration List or the Participant List
    When I click on the actions button
    And I click on the Registration Details
    Then it should redirect me to the registration details page of that specific registration data or the registration of that participant

  @happy
  Scenario: View Registration Details Content
    Given I am on the Registration Details page of a Pending registration
    Then I should see the General Information section (Event Name, Affiliation, Registration Identifier, Payment Method, and Note if there is one)
    And I should see the Participants list showing all individuals included in the registration
    And I should see the Payment Details card (Payment Method, Status, Image (for online), Actions)

  @happy
  Scenario: View Registration Proof of Payment
    Given I am on the Registration Details page of a Pending registration
    Then I should see the Proof of Payment section (Payment Method, Status, Image (for online), Actions)

  @happy
  Scenario Outline: Handle Proof of Payment on the Payment Proof Dialog
    Given I am on the Registration Details page of a Pending registration
    When I click on the Payment Proof Dialog
    And I click on the <action> button
    Then the payment status should change to <result>
    And I should see a message: "<message>"

	# title-format: <action> Action
	Examples:
	  | action  | result   | message                                       |
	  | Accept  | Accepted | Updated successfully                          |
	  | Reject  | Rejected | Payment proof rejected. Rejection email sent. |


  @wip @happy
  Scenario Outline: Display correct number of participant cards
    Given I am on the Registration Details page with <participant_count> participants
    Then I should see <participant_count> participant cards
    And I should see <registrant_count> registrant badge

    # title-format: <participant_count> participants
    Examples:
      | participant_count | registrant_count |
      | 1                 | 1                |
      | 10                | 1                |

  @wip @happy
  Scenario Outline: Payment proof section visibility for different payment methods
    Given I am on the Registration Details page with <payment_method> payment
    Then I should <action> the payment proof section

    # title-format: <payment_method>
    Examples:
      | payment_method | action  |
      | BPI            | see     |
      | Onsite         | not see |

  @wip @happy
  Scenario Outline: Display note field based on registration
    Given I am on the Registration Details page with a registration <note_status> note
    Then I should <visibility> the note field with the message: <message>

    # title-format: Registration with <note_status> note
    Examples:
      | note_status | visibility | message                            |
      | a           | see        | Test note for pending registration |
      | no          | not see    |                                    |

  @critical @sad
  Scenario: Non-existent registration shows not found
    Given I try to view registration details with invalid ID
    Then I should be redirected to an error page or see "This Registration could not be loaded."

  @critical @sad
  Scenario: Unauthorized access to registration management
    Given I am not logged in as admin
    When I try to access the registration list page
    Then I should be redirected back to the login page

  @critical @sad
  Scenario: Invalid filter parameters show error
    Given I am on the registration list page
    When I apply an invalid filter parameter
    Then the filter should default to showing all registrations
