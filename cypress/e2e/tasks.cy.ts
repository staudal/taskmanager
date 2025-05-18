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

const userOne = {
  email: faker.internet.email({ provider: "example.com" }),
  password: faker.internet.password(),
};

const userTwo = {
  email: faker.internet.email({ provider: "example.com" }),
  password: faker.internet.password(),
};

describe("tasks tests", () => {
  beforeEach(() => {
    cy.quickCreateUser(userOne.email, userOne.password);
    cy.quickLogin(userOne.email, userOne.password);
    cy.navigateAndCheckPathname("/tasks");
  });

  afterEach(() => {
    cy.cleanupUser(userOne.email);
    cy.cleanupUser(userTwo.email);
  });

  describe("basic crud", () => {
    it("should allow creating a new task", () => {
      cy.createTask(testTask);

      cy.checkPathname("/tasks");
      cy.findByText(testTask.title).should("exist");
      cy.findByText(testTask.body).should("exist");
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
  });
  describe("error validation", () => {
    it("should show validation errors when title not specified", () => {
      cy.findByRole("link", { name: /create new task/i }).click();
      cy.checkPathname("/tasks/new");
      cy.findByRole("button", { name: /save/i }).click();

      cy.findByText(/title is required/i).should("exist");
    });
  });

  describe("moving tasks", () => {
    it("should show 'Move to In Progress' button when task is in 'Todo' state", () => {
      cy.createTask(testTask);
      cy.findByText(testTask.title).click();

      cy.findByTestId("move-to-todo-button").should("not.exist");
      cy.findByTestId("move-to-in-progress-button").should("exist");
      cy.findByTestId("move-to-done-button").should("not.exist");
    });

    it("should show 'Move to Todo' and 'Move to Done' buttons when task is in 'In Progress' state", () => {
      cy.createTask(testTask);
      cy.findByText(testTask.title).click();

      // Click the button and wait for the status to update
      cy.findByTestId("move-to-in-progress-button").click();

      // Wait for the redirect to complete
      cy.location("pathname").should("eq", "/tasks");

      // Navigate back to the task detail page
      cy.findByText(testTask.title).click();

      // Check for the correct buttons
      cy.findByTestId("move-to-todo-button").should("exist");
      cy.findByTestId("move-to-in-progress-button").should("not.exist");
      cy.findByTestId("move-to-done-button").should("exist");
    });

    it("should show 'Move to In Progress' button when task is in 'Done' state", () => {
      cy.createTask(testTask);
      cy.findByText(testTask.title).click();

      // Move to In Progress
      cy.findByTestId("move-to-in-progress-button").click();
      cy.location("pathname").should("eq", "/tasks");
      cy.findByText(testTask.title).click();

      // Move to Done
      cy.findByTestId("move-to-done-button").click();
      cy.location("pathname").should("eq", "/tasks");
      cy.findByText(testTask.title).click();

      // Check for the correct button
      cy.findByTestId("move-to-todo-button").should("not.exist");
      cy.findByTestId("move-to-in-progress-button").should("exist");
      cy.findByTestId("move-to-done-button").should("not.exist");
    });
  });

  describe("task sharing", () => {
    it("should show share button when user is owner of task", () => {
      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByText("Share").should("exist");
    });

    it("should show share page when user clicks on share button as owner", () => {
      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();
      cy.location("pathname").should("match", /\/tasks\/[^/]+\/share$/);
      cy.findByText("Users with access").should("exist");
    });

    it("should show target user in list when user searches by email", () => {
      cy.quickCreateUser(userTwo.email, userTwo.password);

      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByPlaceholderText("Search by email...").type(userTwo.email);
      cy.findByRole("button", { name: /search/i }).click();

      cy.findByText(userTwo.email).should("exist");
    });

    it("should show error message when no users found with given email", () => {
      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByPlaceholderText("Search by email...").type(
        "someRandomEmail@email.com",
      );
      cy.findByRole("button", { name: /search/i }).click();

      cy.findByText("No users found matching your search.");
    });

    it("should show share options when target user in list is clicked", () => {
      cy.quickCreateUser(userTwo.email, userTwo.password);

      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByPlaceholderText("Search by email...").type(userTwo.email);
      cy.findByRole("button", { name: /search/i }).click();

      cy.findByText(userTwo.email).should("exist").click();
      cy.findByText("Access Level").should("exist");
      cy.findByText("Viewer").should("exist");
      cy.findByText("Editor").should("exist");
      cy.findByRole("button", { name: /share task/i }).should("exist");
    });

    it("should add target user to list of users with share access", () => {
      cy.quickCreateUser(userTwo.email, userTwo.password);

      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByPlaceholderText("Search by email...").type(userTwo.email);
      cy.findByRole("button", { name: /search/i }).click();

      cy.findByText(userTwo.email).should("exist").click();
      cy.findByRole("button", { name: /share task/i }).click();

      cy.findByText("Users with access")
        .parent()
        .within(() => {
          cy.findByText(userTwo.email).should("exist");
        });
    });

    it("should remove user from list of users with share access when remove is clicked", () => {
      cy.quickCreateUser(userTwo.email, userTwo.password);

      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByPlaceholderText("Search by email...").type(userTwo.email);
      cy.findByRole("button", { name: /search/i }).click();

      cy.findByText(userTwo.email).should("exist").click();
      cy.findByRole("button", { name: /share task/i }).click();

      cy.findByText("Users with access")
        .parent()
        .within(() => {
          cy.findByText(userTwo.email).should("exist");
        });

      cy.findByRole("button", { name: /remove/i }).click();

      cy.findByText("Users with access")
        .parent()
        .within(() => {
          cy.findByText(userTwo.email).should("not.exist");
        });
    });

    it("should show empty state when no users with share access", () => {
      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByText("Users with access")
        .parent()
        .within(() => {
          cy.findByText("No users have access to this task yet.").should(
            "exist",
          );
        });
    });

    it("should show shared task in shared tab when logged in as target user", () => {
      cy.quickCreateUser(userTwo.email, userTwo.password);

      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByPlaceholderText("Search by email...").type(userTwo.email);
      cy.findByRole("button", { name: /search/i }).click();

      cy.findByText(userTwo.email).should("exist").click();
      cy.findByRole("button", { name: /share task/i }).click();

      cy.findByText("Users with access")
        .parent()
        .within(() => {
          cy.findByText(userTwo.email).should("exist");
        });

      cy.logout();
      cy.quickLogin(userTwo.email, userTwo.password);
      cy.navigateAndCheckPathname("/tasks");

      cy.findByRole("button", { name: /shared with me \(1\)/i }).click();

      cy.findByText("Todo")
        .parent()
        .within(() => {
          cy.findByText(testTask.title).should("exist");
          cy.findByText(testTask.body).should("exist");
        });
    });

    it("should only show edit button and move buttons when shared user has editor access", () => {
      cy.quickCreateUser(userTwo.email, userTwo.password);

      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByPlaceholderText("Search by email...").type(userTwo.email);
      cy.findByRole("button", { name: /search/i }).click();

      cy.findByText(userTwo.email).should("exist").click();
      cy.findByLabelText("Editor").click();
      cy.findByRole("button", { name: /share task/i }).click();

      cy.findByText("Users with access")
        .parent()
        .within(() => {
          cy.findByText(userTwo.email).should("exist");
          cy.findByText("Access Level: editor").should("exist");
        });

      cy.logout();
      cy.quickLogin(userTwo.email, userTwo.password);
      cy.navigateAndCheckPathname("/tasks");

      cy.findByRole("button", { name: /shared with me \(1\)/i }).click();

      cy.findByText("Todo")
        .parent()
        .within(() => {
          cy.findByText(testTask.title).click();
        });

      cy.findByText("Move to In Progress").should("exist");
      cy.findByRole("link", { name: /edit/i }).should("exist");
      cy.findByRole("link", { name: /share/i }).should("not.exist");
      cy.findByRole("button", { name: /delete task/i }).should("not.exist");
    });

    it("should not show any buttons when shared user has viewer access", () => {
      cy.quickCreateUser(userTwo.email, userTwo.password);

      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByPlaceholderText("Search by email...").type(userTwo.email);
      cy.findByRole("button", { name: /search/i }).click();

      cy.findByText(userTwo.email).should("exist").click();
      cy.findByRole("button", { name: /share task/i }).click();

      cy.findByText("Users with access")
        .parent()
        .within(() => {
          cy.findByText(userTwo.email).should("exist");
          cy.findByText("Access Level: viewer").should("exist");
        });

      cy.logout();
      cy.quickLogin(userTwo.email, userTwo.password);
      cy.navigateAndCheckPathname("/tasks");

      cy.findByRole("button", { name: /shared with me \(1\)/i }).click();

      cy.findByText("Todo")
        .parent()
        .within(() => {
          cy.findByText(testTask.title).click();
        });

      cy.findByText("Move to In Progress").should("not.exist");
      cy.findByRole("link", { name: /edit/i }).should("not.exist");
      cy.findByRole("link", { name: /share/i }).should("not.exist");
      cy.findByRole("button", { name: /delete task/i }).should("not.exist");
    });

    it("should update task correctly for owner when shared user edits the task", () => {
      cy.quickCreateUser(userTwo.email, userTwo.password);

      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByPlaceholderText("Search by email...").type(userTwo.email);
      cy.findByRole("button", { name: /search/i }).click();

      cy.findByText(userTwo.email).should("exist").click();
      cy.findByLabelText("Editor").click();
      cy.findByRole("button", { name: /share task/i }).click();

      cy.findByText("Users with access")
        .parent()
        .within(() => {
          cy.findByText(userTwo.email).should("exist");
          cy.findByText("Access Level: editor").should("exist");
        });

      cy.logout();
      cy.quickLogin(userTwo.email, userTwo.password);
      cy.navigateAndCheckPathname("/tasks");

      cy.findByRole("button", { name: /shared with me \(1\)/i }).click();

      cy.findByText("Todo")
        .parent()
        .within(() => {
          cy.findByText(testTask.title).click();
        });

      cy.editTask(testTask.title, editedTestTask.title, editedTestTask.body);

      cy.navigateAndCheckPathname("/tasks");
      cy.findByRole("button", { name: /shared with me \(1\)/i }).click();

      cy.findByText("Todo")
        .parent()
        .within(() => {
          cy.findByText(editedTestTask.title).should("exist");
          cy.findByText(editedTestTask.body).should("exist");
        });

      cy.logout();
      cy.quickLogin(userOne.email, userOne.password);
      cy.navigateAndCheckPathname("/tasks");

      cy.findByText("Todo")
        .parent()
        .within(() => {
          cy.findByText(editedTestTask.title).should("exist");
          cy.findByText(editedTestTask.body).should("exist");
        });
    });

    it("should remove task from target user when owner removes shared access", () => {
      cy.quickCreateUser(userTwo.email, userTwo.password);

      cy.createTask(testTask);
      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByPlaceholderText("Search by email...").type(userTwo.email);
      cy.findByRole("button", { name: /search/i }).click();

      cy.findByText(userTwo.email).should("exist").click();
      cy.findByRole("button", { name: /share task/i }).click();

      cy.findByText("Users with access")
        .parent()
        .within(() => {
          cy.findByText(userTwo.email).should("exist");
          cy.findByText("Access Level: viewer").should("exist");
        });

      cy.logout();
      cy.quickLogin(userTwo.email, userTwo.password);
      cy.navigateAndCheckPathname("/tasks");

      cy.findByRole("button", { name: /shared with me \(1\)/i }).click();

      cy.findByText("Todo")
        .parent()
        .within(() => {
          cy.findByText(testTask.title).should("exist");
        });

      cy.logout();
      cy.quickLogin(userOne.email, userOne.password);
      cy.navigateAndCheckPathname("/tasks");

      cy.findByText(testTask.title).click();
      cy.findByRole("link", { name: /share/i }).click();

      cy.findByText("Users with access")
        .parent()
        .within(() => {
          cy.findByText(userTwo.email).should("exist");
        });

      cy.findByRole("button", { name: /remove/i }).click();

      cy.logout();
      cy.quickLogin(userTwo.email, userTwo.password);
      cy.navigateAndCheckPathname("/tasks");

      cy.findByRole("button", { name: /shared with me \(0\)/i }).click();

      cy.findByText("No tasks have been shared with you yet.").should("exist");
    });
  });
});
