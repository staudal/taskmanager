import { faker } from "@faker-js/faker";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      extractTaskIdFromUrl: () => Cypress.Chainable<string>;
      taskShouldExistInList: (id: string) => Cypress.Chainable<void>;
      taskShouldNotExistInList: (id: string) => Cypress.Chainable<void>;
      createTask: (params: {
        title: string;
        body: string;
        color: string;
      }) => Cypress.Chainable<void>;
      editTask: (existingTitle: string) => Cypress.Chainable<void>;
      deleteTask: (id: string) => Cypress.Chainable<void>;
    }
  }
}

function extractTaskIdFromUrl() {
  return cy.url().then((url) => {
    const match = url.match(/\/tasks\/([^/?#/]+)/);
    if (!match || !match[1]) {
      cy.log(`Failed to extract taskId from URL: ${url}`);
      throw new Error(`Could not extract taskId from URL: ${url}`);
    }
    return match[1];
  });
}

function taskShouldExistInList(id: string) {
  cy.findByTestId(id).should("exist");
}

function taskShouldNotExistInList(id: string) {
  cy.findByTestId(id).should("not.exist");
}

function selectTaskColor(color: string) {
  cy.get(`input[type="radio"][name="color"][value="${color}"]`)
    .parent()
    .find("label")
    .click();
}

function createTask({
  title,
  body,
  color,
}: {
  title: string;
  body: string;
  color: string;
}) {
  cy.findByRole("link", { name: /create new task/i }).click();
  cy.checkPathname("/tasks/new");

  cy.findByLabelText(/title/i).type(title);
  cy.findByLabelText(/body/i).type(body);
  selectTaskColor(color);

  cy.findByRole("button", { name: /save/i }).click();
  cy.checkPathname("tasks");
}

function editTask(existingTitle: string) {
  cy.findByText(existingTitle).click();
  cy.findByRole("link", { name: /edit/i }).click();
  cy.checkPathname("/edit");

  cy.findByLabelText(/title/i).clear();
  cy.findByLabelText(/title/i).type(faker.lorem.words(3));
  cy.findByLabelText(/body/i).clear();
  cy.findByLabelText(/body/i).type(faker.lorem.paragraph());
  selectTaskColor("bg-blue-100");

  cy.findByRole("button", { name: /save/i }).click();
  cy.checkPathname("tasks");
}

function deleteTask(id: string) {
  cy.navigateAndCheckPathname(`/tasks/${id}`);
  cy.findByRole("button", { name: /delete task/i }).click();
}

export const registerTaskCommands = () => {
  Cypress.Commands.add("extractTaskIdFromUrl", extractTaskIdFromUrl);
  Cypress.Commands.add("taskShouldExistInList", taskShouldExistInList);
  Cypress.Commands.add("taskShouldNotExistInList", taskShouldNotExistInList);
  Cypress.Commands.add("createTask", createTask);
  Cypress.Commands.add("editTask", editTask);
  Cypress.Commands.add("deleteTask", deleteTask);
};
