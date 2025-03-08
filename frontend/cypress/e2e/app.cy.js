describe('User Management System E2E Test', () => {
  it('Loads the home page and checks for the heading', () => {
      cy.visit('http://localhost:3000'); // Ensure your app is running
      cy.contains('User Management System').should('be.visible'); // Check if the main heading is visible
  });
});
