@smoke @critical
Feature: Membership Application

  Background:
    Given I am on the membership application page

  # ========== NEW MEMBER PATH ==========

  @smoke
  Scenario: New member can complete full application with Onsite payment
    When I select "New Member" as the application type
    And I fill in company details with valid data
    And I fill in representative details
    And I confirm the review information
    And I select "Corporate" membership with "Onsite" payment
    And I submit the application
    Then I should see the application success page
    And the page should display my application ID

  @smoke
  Scenario: New member with BPI payment uploads proof
    When I select "New Member" as the application type
    And I fill in company details with valid data
    And I fill in representative details
    And I confirm the review information
    And I select "Personal" membership with "BPI" payment
    And I upload a payment proof image
    And I submit the application
    Then I should see the application success page

  @sad
  Scenario: New member cannot submit with BPI but no proof
    When I select "New Member" as the application type
    And I fill in company details with valid data
    And I fill in representative details
    And I confirm the review information
    And I select "Corporate" membership with "BPI" payment
    And I do not upload a payment proof
    And I attempt to submit the application
    Then I should see a validation error for the payment proof

  @sad
  Scenario: New member cannot proceed without company logo
    When I select "New Member" as the application type
    And I fill in company details without a logo
    And I attempt to go to the next step
    Then I should see a validation error for the company logo

  # ========== RENEWAL PATH ==========

  @smoke
  Scenario: Member can renew with valid cancelled status
    When I select "Renewal" as the application type
    And I enter a valid business member identifier for a cancelled member
    And my membership is verified successfully
    Then the company details should be pre-filled from my existing record
    When I proceed with the pre-filled company details
    And I proceed with the pre-filled representative details
    And I confirm the review information
    And I select "Corporate" membership with "Onsite" payment
    And I submit the application
    Then I should see the application success page

  @sad
  Scenario: Renewal with non-cancelled member shows error
    When I select "Renewal" as the application type
    And I enter a business member identifier that is not cancelled
    Then I should see an error that renewal requires cancelled status

  @sad
  Scenario: Renewal with non-existent identifier shows error
    When I select "Renewal" as the application type
    And I enter a non-existent business member identifier
    Then I should see a "member not found" error

  # ========== UPDATE INFO PATH ==========

  @smoke
  Scenario: Member can update info for free
    When I select "Update Info" as the application type
    And I enter a valid business member identifier for a paid member
    And my membership is verified successfully
    When I proceed to payment
    Then I should see an "updates are free" alert
    And no membership type selection should be shown
    When I submit the application
    Then I should see the application success page

  @smoke
  Scenario: Personal member can upgrade to corporate on update
    When I select "Update Info" as the application type
    And I enter a valid business member identifier for a personal member
    And my membership is verified successfully
    When I proceed to payment
    Then I should see an option to upgrade to corporate
    When I select "Upgrade to Corporate" and pay with Onsite
    And I submit the application
    Then I should see the application success page

  @sad
  Scenario: Cancelled member on update path told to choose renewal
    When I select "Update Info" as the application type
    And I enter a valid business member identifier for a cancelled member
    Then I should see an error suggesting to choose renewal instead
