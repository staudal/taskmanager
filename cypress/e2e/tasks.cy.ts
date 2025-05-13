import { faker } from "@faker-js/faker";

const testTask = {
  title: faker.lorem.words(3),
  body: faker.lorem.paragraph(),
  color: "bg-green-100",
};

const editedTestTask = {
  title: faker.lorem.words(3),
  body: faker.lorem.paragraph(),
  color: "bg-green-100",
};

describe("tasks tests", () => {
  beforeEach(() => {
    cy.quickLogin();
    cy.navigateAndCheckPathname("/tasks");
  });

  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow creating a new task", () => {
    cy.createTask(testTask);

    cy.checkPathname("/tasks");
    cy.findByText(testTask.title).should("exist");
    cy.findByText(testTask.body).should("exist");
  });

  it("should show validation errors when title not specified", () => {
    cy.findByRole("link", { name: /create new task/i }).click();
    cy.checkPathname("/tasks/new");
    cy.findByRole("button", { name: /save/i }).click();

    cy.findByText(/title is required/i).should("exist");
  });

  it("should allow viewing a task's details", () => {
    cy.createTask(testTask);
    cy.findByText(testTask.title).click();

    cy.checkPathname("/tasks/");
    cy.findByText("Task Details").should("exist");
    cy.findByText(testTask.title).should("exist");
    cy.findByText(testTask.body).should("exist");
  });

  it("should allow editing a task from the details page", () => {
    cy.createTask(testTask);

    cy.findByText(testTask.title).should("exist");
    cy.findByText(testTask.body).should("exist");

    cy.editTask(testTask.title, editedTestTask.title, editedTestTask.body);

    cy.findByText(testTask.title).should("not.exist");
    cy.findByText(testTask.body).should("not.exist");

    cy.findByText(editedTestTask.title).should("exist");
    cy.findByText(editedTestTask.body).should("exist");
  });

  it("should allow deleting a task from the details page", () => {
    cy.createTask(testTask);

    cy.findByText(testTask.title).should("exist");
    cy.findByText(testTask.body).should("exist");

    cy.deleteTask(testTask.title);

    cy.findByText(testTask.title).should("not.exist");
    cy.findByText(testTask.body).should("not.exist");
  });

  it("should show 'Move to In Progress' button when task is in 'Todo' state", () => {
    cy.createTask(testTask);
    cy.findByText(testTask.title).click();

    cy.findByText("Move to Todo").should("not.exist");
    cy.findByText("Move to In Progress").should("exist");
    cy.findByText("Move to Done").should("not.exist");
  });

  it("should show 'Move to Todo' and 'Move to Done' buttons when task is in 'In Progress' state", () => {
    cy.createTask(testTask);
    cy.findByText(testTask.title).click();

    cy.findByText("Move to In Progress").click();
    cy.findByText(testTask.title).click();

    cy.findByText("Move to Todo").should("exist");
    cy.findByText("Move to In Progress").should("not.exist");
    cy.findByText("Move to Done").should("exist");
  });

  it("should show 'Move to In Progress' button when task is in 'Done' state", () => {
    cy.createTask(testTask);
    cy.findByText(testTask.title).click();

    cy.findByText("Move to In Progress").click();
    cy.findByText(testTask.title).click();

    cy.findByText("Move to Done").click();
    cy.findByText(testTask.title).click();

    cy.findByText("Move to Todo").should("not.exist");
    cy.findByText("Move to In Progress").should("exist");
    cy.findByText("Move to Done").should("not.exist");
  });
});
