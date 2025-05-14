import { faker } from "@faker-js/faker";

const testUser = {
  email: faker.internet.username() + "@example.com",
  password: faker.internet.password(),
};

describe("auth tests", () => {
  afterEach(() => {
    cy.cleanupUser(testUser.email);
  });

  beforeEach(() => {
    cy.then(() => testUser).as("user");
    cy.visit("/");
  });

  it("should allow you to register a new user", () => {
    cy.signup(testUser);
    cy.checkPathname("/tasks");
  });

  it("should allow you to login as an existing user", () => {
    cy.signup(testUser);
    cy.logout();
    cy.login(testUser);
    cy.checkPathname("/tasks");
  });

  it("should show error when user enters already registered email", () => {
    cy.signup(testUser);
    cy.logout();
    cy.signup(testUser);
    cy.findByText(/user already exists/i).should("exist");
  });

  it("should show error when user enters wrong email or password", () => {
    cy.signup(testUser);
    cy.logout();
    cy.login({ email: testUser.email, password: "wrongpassword" });
    cy.findByText(/Invalid email or password/i).should("exist");
  });

  it("should navigate between login and register", () => {
    cy.findByRole("link", { name: /sign up/i }).click();
    cy.checkPathname("/join");

    cy.findByRole("link", { name: /log in/i }).click();
    cy.checkPathname("/login");

    cy.findByRole("link", { name: /create account/i }).click();
    cy.checkPathname("/join");
  });

  it("should show warning when password is too short", () => {
    cy.signup({ email: testUser.email, password: "short" });
    cy.findByText(/Password is too short/i).should("exist");
  });

  it("should log in as random user when using the quickCreateUser and quickLogin methods", () => {
    cy.quickCreateUser(testUser.email, testUser.password);
    cy.quickLogin(testUser.email, testUser.password);
    cy.navigateAndCheckPathname("/tasks");
  });
});
