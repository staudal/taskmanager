declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      createTask: (params: {
        title: string;
        body: string;
        color: string;
      }) => Cypress.Chainable<void>;
      editTask: (
        existingTitle: string,
        newTitle: string,
        newBody: string,
      ) => Cypress.Chainable<void>;
      deleteTask: (id: string) => Cypress.Chainable<void>;
    }
  }
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

function editTask(existingTitle: string, newTitle: string, newBody: string) {
  cy.findByText(existingTitle).click();
  cy.findByRole("link", { name: /edit/i }).click();
  cy.checkPathname("/edit");

  cy.findByLabelText(/title/i).clear();
  cy.findByLabelText(/title/i).type(newTitle);
  cy.findByLabelText(/body/i).clear();
  cy.findByLabelText(/body/i).type(newBody);
  selectTaskColor("bg-blue-100");

  cy.findByRole("button", { name: /save/i }).click();
  cy.checkPathname("tasks");
}

function deleteTask(title: string) {
  cy.findByText(title).click();
  cy.findByRole("button", { name: /delete task/i }).click();
}

export const registerTaskCommands = () => {
  Cypress.Commands.add("createTask", createTask);
  Cypress.Commands.add("editTask", editTask);
  Cypress.Commands.add("deleteTask", deleteTask);
};
