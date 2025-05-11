import { faker } from "@faker-js/faker";

function createRandomTask(color = "bg-green-100") {
  const title = faker.lorem.words(3);
  const body = faker.lorem.paragraph();
  return { title, body, color };
}

function getTaskIdFromUrl(url: string) {
  const match = url.match(/\/tasks\/(.+)$/);
  if (!match || !match[1]) throw new Error("Could not extract taskId from URL");
  return match[1];
}

describe("tasks tests", () => {
  beforeEach(() => {
    cy.quickLogin();
    cy.visitAndCheck("/tasks");
  });

  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow creating a new task", () => {
    const task = createRandomTask();
    cy.createTask(task);
    cy.findByText(task.title).should("exist");
  });

  it("should show validation errors when submitting an empty task", () => {
    cy.findByRole("link", { name: /create new task/i }).click();
    cy.url().should("include", "/tasks/new");
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByText(/title is required/i).should("exist");
  });

  it("should allow viewing a task's details", () => {
    const task = createRandomTask();
    cy.createTask(task);
    cy.findByText(task.title).click();
    cy.url().should("include", "/tasks/");
    cy.url().should("not.include", "/edit");
    cy.findByText(task.title).should("exist");
    cy.findByText(task.body).should("exist");
  });

  it("should allow editing a task from the details page", () => {
    const task = createRandomTask();
    const newTask = createRandomTask("bg-blue-100");
    cy.createTask(task);
    cy.findByText(task.title).click();
    cy.findByRole("link", { name: /edit/i }).click();
    cy.editTask({
      title: newTask.title,
      body: newTask.body,
      color: newTask.color,
    });
    cy.findByText(newTask.title).should("exist");
    cy.findByText(newTask.body).should("exist");
  });

  it("should allow deleting a task from the details page", () => {
    const task = createRandomTask();
    cy.createTask(task);
    cy.findByText(task.title).click();
    cy.url().then((url) => {
      const taskId = getTaskIdFromUrl(url);
      cy.deleteTask(taskId);
      cy.url().should("eq", `${Cypress.config().baseUrl}/tasks`);
      cy.findByText(task.title).should("not.exist");
    });
  });
});
