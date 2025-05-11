declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Creates a new task
       *
       * @param params - An objet containing the title, body, and color of the task
       * @returns {Chainable<void>}
       * @memberof Chainable
       * @example
       *    cy.createTask({ title: 'Task Title', body: 'Task Body', color: 'bg-green-100' })
       */
      createTask: (params: {
        title: string;
        body: string;
        color: string;
      }) => Cypress.Chainable<void>;

      /**
       * Edits an existing task
       *
       * @param params - An object containing the title, body, and color of the task
       * @returns {Chainable<void>}
       * @memberof Chainable
       * @example
       *    cy.editTask({ title: 'Updated Title', body: 'Updated Body', color: 'bg-blue-100' })
       */
      editTask: (params: {
        title: string;
        body: string;
        color: string;
      }) => Cypress.Chainable<void>;

      /**
       * Deletes an existing task
       *
       * @param id - The id of the task to delete
       * @returns {Chainable<void>}
       * @memberof Chainable
       * @example
       *    cy.deleteTask('123')
       */
      deleteTask: (id: string) => Cypress.Chainable<void>;
    }
  }
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
  // Navigate to new task form
  cy.findByRole("link", { name: /create new task/i }).click();
  cy.url().should("include", "/tasks/new");

  // Fill out the task form
  cy.findByLabelText(/title/i).type(title);
  cy.findByLabelText(/body/i).type(body);

  // Select the color by clicking on the appropriate radio button
  cy.get(`input[type="radio"][name="color"][value="${color}"]`)
    .parent()
    .find("label")
    .click();

  cy.findByRole("button", { name: /save/i }).click();

  // Verify we're redirected to tasks list
  cy.url().should("include", "/tasks");
}

function editTask({
  title,
  body,
  color,
}: {
  title: string;
  body: string;
  color: string;
}) {
  // Fill out the task form
  cy.findByLabelText(/title/i).clear();
  cy.findByLabelText(/title/i).type(title);
  cy.findByLabelText(/body/i).clear();
  cy.findByLabelText(/body/i).type(body);

  cy.get(`input[type="radio"][name="color"][value="${color}"]`)
    .parent()
    .find("label")
    .click();

  cy.findByRole("button", { name: /save/i }).click();
}

function deleteTask(id: string) {
  cy.visitAndCheck(`/tasks/${id}`);
  cy.findByRole("button", { name: /delete task/i }).click();
}

export const registerTaskCommands = () => {
  Cypress.Commands.add("createTask", createTask);
  Cypress.Commands.add("editTask", editTask);
  Cypress.Commands.add("deleteTask", deleteTask);
};
