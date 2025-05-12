declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      navigateAndCheckPathname: typeof navigateAndCheckPathname;
      checkPathname: typeof checkPathname;
    }
  }
}

function navigateAndCheckPathname(url: string, waitTime = 100) {
  cy.visit(url);
  cy.location("pathname").should("contain", url).wait(waitTime);
}

function checkPathname(url: string) {
  cy.location("pathname").should("contain", url);
}

export const registerGlobalCommands = () => {
  Cypress.Commands.add("navigateAndCheckPathname", navigateAndCheckPathname);
  Cypress.Commands.add("checkPathname", checkPathname);
};
