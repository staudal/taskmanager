import { faker } from "@faker-js/faker";

describe("auth tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register a new user", () => {
    const email = faker.internet.username() + "@example.com";
    const password = faker.internet.password();
    cy.then(() => ({ email })).as("user");

    cy.signup(email, password);
    cy.url().should("include", "/tasks");
  });

  it("should allow you to login as an existing user", () => {
    // setting up
    const email = faker.internet.username() + "@example.com";
    const password = faker.internet.password();
    cy.then(() => ({ email })).as("user");

    cy.signup(email, password);
    cy.logout();
    cy.login({ email, password });
    cy.url().should("include", "/tasks");
  });

  it("should show error when user enters already registered email", () => {
    // setting up
    const email = faker.internet.username() + "@example.com";
    const password = faker.internet.password();
    cy.then(() => ({ email })).as("user");

    cy.signup(email, password);
    cy.logout();
    cy.signup(email, password);
    cy.findByText(/user already exists/i).should("exist");
  });

  it("should show error when user enters wrong email or password", () => {
    // setting up
    const email = faker.internet.username() + "@example.com";
    const wrongEmail = faker.internet.username() + "@example.com";
    const password = faker.internet.password();
    cy.then(() => ({ email })).as("user");

    cy.signup(email, password);
    cy.logout();
    cy.login({ email: wrongEmail, password });
    cy.findByText(/Invalid email or password/i).should("exist");
  });

  it("should navigate between login and register", () => {
    // setting up
    const email = faker.internet.username() + "@example.com";
    cy.then(() => ({ email })).as("user");

    cy.visitAndCheck("/");
    cy.findByRole("link", { name: /sign up/i }).click();
    cy.url().should("include", "/join");

    cy.findByRole("link", { name: /log in/i }).click();
    cy.url().should("include", "/login");

    cy.findByRole("link", { name: /create account/i }).click();
    cy.url().should("include", "/join");
  });

  it("should show warning when password is too short", () => {
    // setting up
    const email = faker.internet.username() + "@example.com";
    const password = faker.internet.password({ length: 4 });
    cy.then(() => ({ email })).as("user");

    cy.signup(email, password);
    cy.findByText(/Password is too short/i).should("exist");
  });
});
