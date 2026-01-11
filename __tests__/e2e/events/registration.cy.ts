/**
 * End-to-end test for event registration flow
 * Tests the complete user journey for registering to an event
 */
describe("Event Registration Flow", () => {
  beforeEach(() => {
    // Set up test data - you might want to use fixtures
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should display list of available events", () => {
    cy.visit("/events");

    // Should show events page
    cy.url().should("include", "/events");

    // Should display event cards or list
    cy.get('[data-testid="event-card"]').should("have.length.at.least", 1);
  });

  it("should allow user to register for an event", () => {
    cy.visit("/events");

    // Click on first event
    cy.get('[data-testid="event-card"]').first().click();

    // Should navigate to event details
    cy.url().should("match", /\/events\/[^/]+/);

    // Click register button
    cy.get('[data-testid="register-button"]').click();

    // Should navigate to registration form
    cy.url().should("include", "/registration");

    // Fill in registration form
    cy.get('input[name="firstName"]').type("John");
    cy.get('input[name="lastName"]').type("Doe");
    cy.get('input[name="email"]').type("john.doe@example.com");
    cy.get('input[name="phone"]').type("+639171234567");

    // Submit registration
    cy.get('button[type="submit"]').click();

    // Should show success message or redirect to success page
    cy.url().should("include", "/registration/success");
    cy.contains(/registration successful|thank you/i).should("be.visible");
  });

  it("should validate required fields in registration form", () => {
    // Navigate directly to registration page with event ID
    cy.visit("/registration/e/test-event-id");

    // Try to submit without filling required fields
    cy.get('button[type="submit"]').click();

    // Should show validation errors
    cy.contains(/required|cannot be empty/i).should("be.visible");

    // Should not navigate away
    cy.url().should("include", "/registration");
  });

  it("should show event details on registration form", () => {
    cy.visit("/events");

    // Navigate to first event and then to registration
    cy.get('[data-testid="event-card"]').first().click();
    cy.get('[data-testid="register-button"]').click();

    // Event information should be displayed on registration form
    cy.get('[data-testid="event-info"]').should("be.visible");
  });

  it("should handle registration for full/closed events", () => {
    // This test assumes there's a closed/full event in the system
    cy.visit("/events");

    // Find a closed event (you might need to set this up in test data)
    cy.contains("Full")
      .parents('[data-testid="event-card"]')
      .within(() => {
        // Register button should be disabled or not exist
        cy.get('[data-testid="register-button"]').should("be.disabled");
      });
  });
});
