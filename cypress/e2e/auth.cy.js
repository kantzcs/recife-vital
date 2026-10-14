describe("Autenticação", () => {
  it("não libera a área interna quando o cadastro retorna usuário sem sessão", () => {
    cy.fixture("unconfirmed-user.json").then((user) => {
      cy.intercept("POST", "**/auth/v1/signup*", {
        statusCode: 200,
        body: { user, session: null },
      }).as("signup");
    });

    cy.intercept("**/rest/v1/profiles*", { statusCode: 200, body: [] }).as(
      "profileRequest"
    );

    cy.visit("/");
    cy.get('[data-cy="auth-signup"]').click();
    cy.get('[data-cy="auth-name"]').type("Pessoa Teste");
    cy.get('[data-cy="auth-email"]').type("teste@example.invalid");
    cy.get('[data-cy="auth-password"]').type("senha-de-teste");
    cy.get('[data-cy="auth-confirm-password"]').type("senha-de-teste");
    cy.get('[data-cy="auth-submit"]').click();

    cy.wait("@signup");
    cy.contains(/confirme seu e-mail/i).should("be.visible");
    cy.get('[data-cy="auth-form"]').should("be.visible");
    cy.get('[data-cy="app-shell"]').should("not.exist");
    cy.get("@profileRequest.all").should("have.length", 0);
  });

  it("valida campos obrigatórios e rejeita senhas diferentes no cadastro", () => {
    cy.intercept("POST", "**/auth/v1/signup*").as("signup");
    cy.visit("/");
    cy.get('[data-cy="auth-form"]').then(($form) => {
      expect($form[0].checkValidity()).to.equal(false);
    });

    cy.get('[data-cy="auth-signup"]').click();
    cy.get('[data-cy="auth-name"]').type("Pessoa Teste");
    cy.get('[data-cy="auth-email"]').type("teste@example.invalid");
    cy.get('[data-cy="auth-password"]').type("senha-um");
    cy.get('[data-cy="auth-confirm-password"]').type("senha-dois");
    cy.get('[data-cy="auth-submit"]').click();

    cy.contains("As senhas não conferem.").should("be.visible");
    cy.get("@signup.all").should("have.length", 0);
  });

  it("mostra uma mensagem clara quando o login é rejeitado", () => {
    cy.intercept("POST", "**/auth/v1/token*", {
      statusCode: 400,
      body: {
        code: "invalid_credentials",
        message: "Invalid login credentials",
      },
    }).as("login");

    cy.visit("/");
    cy.get('[data-cy="auth-email"]').type("teste@example.invalid");
    cy.get('[data-cy="auth-password"]').type("senha-incorreta");
    cy.get('[data-cy="auth-submit"]').click();

    cy.wait("@login");
    cy.get('[data-cy="auth-error"]')
      .should("be.visible")
      .and("contain", "E-mail ou senha inválidos");
    cy.get('[data-cy="auth-form"]').should("be.visible");
    cy.get('[data-cy="app-shell"]').should("not.exist");
  });

  it("entra após login válido e carrega os dados necessários", () => {
    cy.fixture("test-session.json").then((session) => {
      cy.intercept("POST", "**/auth/v1/token*", { body: session }).as("login");
    });
    cy.stubProfileData();

    cy.visit("/");
    cy.get('[data-cy="auth-email"]').type("teste@example.invalid");
    cy.get('[data-cy="auth-password"]').type("senha-de-teste");
    cy.get('[data-cy="auth-submit"]').click();

    cy.wait("@login");
    cy.get('[data-cy="app-shell"]').should("be.visible");
    cy.wait("@loadProfile");
    cy.wait("@createProfile");
    cy.wait("@loadAppointments");
    cy.wait("@loadRewards");
    cy.wait("@createRewards");
  });

  it("restaura o acesso quando já existe uma sessão", () => {
    cy.stubProfileData();
    cy.visitWithSession();

    cy.get('[data-cy="app-shell"]').should("be.visible");
    cy.wait("@loadProfile");
    cy.wait("@createProfile");
    cy.wait("@loadAppointments");
    cy.wait("@loadRewards");
    cy.wait("@createRewards");
  });

  it("encerra a sessão no logout e continua desconectado após recarregar", () => {
    cy.stubProfileData();
    cy.intercept("POST", "**/auth/v1/logout*", { statusCode: 204, body: "" }).as(
      "logout"
    );
    cy.visitWithSession();
    cy.get('[data-cy="app-shell"]').should("be.visible");

    cy.get('[data-cy="logout"]').click();
    cy.wait("@logout");
    cy.get('[data-cy="auth-form"]').should("be.visible");
    cy.reload();

    cy.get('[data-cy="auth-form"]').should("be.visible");
    cy.get('[data-cy="app-shell"]').should("not.exist");
  });
});
