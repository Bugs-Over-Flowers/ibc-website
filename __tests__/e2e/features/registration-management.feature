@smoke
Feature: Registration Management

  @critical
  Scenario: Registration Details Navigation
    Given I am seeing a row under the Registration List or the Participant List
    When I click on the actions button
    And I click on the Registration Details
    Then it should redirect me to the registration details page of that specific registration data or the registration of that participant

  @smoke
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

  @smoke
  Scenario: Accept Proof of Payment
    Given I am on the Registration Details page
    When I click on the Accept button
    Then the payment status should change to "Paid"
    And I should see a confirmation message
  # @wip
# Scenario Outline: Display correct number of participant cards
#   Given I am on the Registration Details page with <participant_count> participants
#   Then I should see <participant_count> participant cards
#   And I should see <registrant_count> registrant badge
#   Examples:
#     | participant_count | registrant_count  |
#     | 1                 | 1                 |
#     | 10                | 1                 |

  @wip
  Scenario Outline: Payment proof handling for different payment methods
    Given I am on the Registration Details page with <payment_method> payment
    Then I should <action> the payment proof acceptance option

    # title-format: <payment_method>
    Examples:
      | payment_method | action  |
      | BPI            | see     |
      | Onsite         | not see |

  @wip
  Scenario Outline: Display note field based on registration
    Given I am on the Registration Details page with a registration <note_status> note
    Then I should <visibility> the note field

    # title-format: Registration with <note_status> note
    Examples:
      | note_status | visibility |
      | a           | see        |
      | no          | not see    |
