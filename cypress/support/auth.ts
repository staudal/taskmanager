declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in a user via the UI with the provided email and password.
       *
       * @param params - An object containing the email and password to use for login
       * @returns {Chainable<void>}
       * @memberof Chainable
       * @example
       *    cy.login({ email: 'user@example.com', password: 'password123' })
       */
      login: (params: {
        email: string;
        password: string;
      }) => Cypress.Chainable<void>;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupUser}
       * @memberof Chainable
       * @example
       *    cy.cleanupUser()
       * @example
       *    cy.cleanupUser({ email: 'whatever@example.com' })
       */
      cleanupUser: typeof cleanupUser;

      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       *  @example
       *    cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck;

      /**
       * Signs up a new user via the UI
       *
       * @param email - The email to use for signup
       * @param password - The password to use for signup
       * @returns {typeof signup}
       * @memberof Chainable
       * @example
       *    cy.signup('test@example.com', 'password123')
       */
      signup: typeof signup;

      /**
       * Logs out the current user
       *
       * @returns {typeof logout}
       * @memberof Chainable
       * @example
       *    cy.logout()
       */
      logout: typeof logout;
    }
  }
}

function login({ email, password }: { email: string; password: string }) {
  // Store both email and password as the user alias
  cy.wrap({ email, password }).as("user");
  // Log in via the UI
  cy.visitAndCheck("/");
  cy.findByRole("link", { name: /log in/i }).click();
  cy.findByLabelText(/email/i).type(email);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole("button", { name: /log in/i }).click();
}

function cleanupUser({ email }: { email?: string } = {}) {
  if (email) {
    deleteUserByEmail(email);
  } else {
    cy.get("@user").then((user) => {
      const email = (user as { email?: string }).email;
      if (email) {
        deleteUserByEmail(email);
      }
    });
  }
  cy.clearCookie("__session");
}

function deleteUserByEmail(email: string) {
  cy.exec(`npx tsx ./cypress/support/delete-user.ts "${email}"`);
  cy.clearCookie("__session");
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime = 1000) {
  cy.visit(url);
  cy.location("pathname").should("contain", url).wait(waitTime);
}

function signup(email: string, password: string) {
  cy.visitAndCheck("/");
  cy.findByRole("link", { name: /sign up/i }).click();
  cy.findByLabelText(/email/i).type(email);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole("button", { name: /create account/i }).click();
}

function logout() {
  // Click the avatar button (which opens the dropdown)
  cy.findByRole("button", { name: /log out/i }).click();
}

export const registerAuthCommands = () => {
  Cypress.Commands.add("login", login);
  Cypress.Commands.add("cleanupUser", cleanupUser);
  Cypress.Commands.add("visitAndCheck", visitAndCheck);
  Cypress.Commands.add("signup", signup);
  Cypress.Commands.add("logout", logout);
};
