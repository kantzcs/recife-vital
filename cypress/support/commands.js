Cypress.Commands.add("stubProfileData", (appointments = []) => {
  cy.intercept("GET", "**/rest/v1/profiles?*", { body: [] }).as("loadProfile");
  cy.intercept("POST", "**/rest/v1/profiles*", { statusCode: 201, body: [] }).as(
    "createProfile"
  );
  cy.intercept("GET", "**/rest/v1/appointments?*", (request) => {
    request.reply({
      body:
        typeof appointments === "function" ? appointments() : appointments,
    });
  }).as("loadAppointments");
  cy.intercept("GET", "**/rest/v1/user_rewards?*", { body: [] }).as(
    "loadRewards"
  );
  cy.intercept("POST", "**/rest/v1/user_rewards*", {
    statusCode: 201,
    body: [],
  }).as("createRewards");
});

Cypress.Commands.add("visitWithSession", () => {
  cy.fixture("test-session.json").then((session) => {
    cy.visit("/", {
      onBeforeLoad(window) {
        window.localStorage.setItem("sb-127-auth-token", JSON.stringify(session));
      },
    });
  });
});
