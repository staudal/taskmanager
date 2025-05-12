import { faker } from "@faker-js/faker";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      quickLogin: typeof quickLogin;
      login: (params: {
        email: string;
        password: string;
      }) => Cypress.Chainable<void>;
      signup: (params: {
        email: string;
        password: string;
      }) => Cypress.Chainable<void>;
      cleanupUser: typeof cleanupUser;
      logout: typeof logout;
    }
  }
}

function quickLogin({
  email = faker.internet.email({ provider: "example.com" }),
}: {
  email?: string;
} = {}) {
  cy.then(() => ({ email })).as("user");
  cy.exec(`npx tsx ./cypress/support/create-user.ts "${email}"`).then(
    ({ stdout }) => {
      const cookieValue = stdout
        .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
        .trim();
      cy.setCookie("__session", cookieValue);
    },
  );
  return cy.get("@user");
}

function login({ email, password }: { email: string; password: string }) {
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

function signup({ email, password }: { email: string; password: string }) {
  cy.findByRole("link", { name: /sign up/i }).click();
  cy.findByLabelText(/email/i).type(email);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole("button", { name: /create account/i }).click();
}

function logout() {
  cy.findByRole("button", { name: /log out/i }).click();
}

export const registerAuthCommands = () => {
  Cypress.Commands.add("quickLogin", quickLogin);
  Cypress.Commands.add("login", login);
  Cypress.Commands.add("cleanupUser", cleanupUser);
  Cypress.Commands.add("signup", signup);
  Cypress.Commands.add("logout", logout);
};
