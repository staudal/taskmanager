import "@testing-library/cypress/add-commands";
import { registerAuthCommands } from "./auth";
import { registerGlobalCommands } from "./global";
import { registerTaskCommands } from "./task";

registerGlobalCommands();
registerAuthCommands();
registerTaskCommands();

Cypress.on("uncaught:exception", (err) => {
  // Cypress and React Hydrating the document don't get along
  // for some unknown reason. Hopefully we figure out why eventually
  // so we can remove this.
  if (
    /hydrat/i.test(err.message) ||
    /Minified React error #418/.test(err.message) ||
    /Minified React error #423/.test(err.message)
  ) {
    return false;
  }
});
