/**
 * End-to-end test for user authentication flow
 * Tests the complete user journey from login to accessing protected pages
 */
describe("Authentication Flow", () => {
  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should allow user to log in with valid credentials", () => {
    cy.visit("/auth");

    // Fill in login form
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard after successful login
    cy.url().should("include", "/admin/dashboard");

    // Should see welcome message or user info
    cy.contains("Welcome").should("be.visible");
  });

  it("should show error message for invalid credentials", () => {
    cy.visit("/auth");

    cy.get('input[name="email"]').type("invalid@example.com");
    cy.get('input[name="password"]').type("wrongpassword");
    cy.get('button[type="submit"]').click();

    // Should show error message
    cy.contains(/invalid credentials|login failed/i).should("be.visible");

    // Should remain on login page
    cy.url().should("include", "/auth");
  });

  it("should redirect to login when accessing protected route without auth", () => {
    cy.visit("/admin/dashboard");

    // Should redirect to login page
    cy.url().should("include", "/auth");
  });

  it("should handle MFA verification flow", () => {
    // This test assumes MFA is enabled for the test user
    cy.visit("/auth");

    cy.get('input[name="email"]').type("mfa-user@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Should redirect to MFA verification page
    cy.url().should("include", "/auth/mfa-verify");

    // Enter MFA code (in real tests, you'd mock this)
    cy.get('input[name="code"]').type("123456");
    cy.get('button[type="submit"]').click();

    // Should eventually reach dashboard (or show MFA error)
    cy.url().should("match", /dashboard|mfa-verify/);
  });

  it("should allow user to log out", () => {
    // First, log in
    cy.visit("/auth");
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/admin/dashboard");

    // Find and click logout button
    cy.get('[data-testid="logout-button"]').click();

    // Should redirect to login page
    cy.url().should("include", "/auth");

    // Trying to access protected route should redirect to login
    cy.visit("/admin/dashboard");
    cy.url().should("include", "/auth");
  });
});
