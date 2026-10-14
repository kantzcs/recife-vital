describe("Agendamentos", () => {
  it("cria e mostra novamente um agendamento após recarregar (API simulada)", () => {
    let savedAppointment;
    cy.stubProfileData(() => (savedAppointment ? [savedAppointment] : []));
    cy.intercept("POST", "**/rest/v1/appointments*", (request) => {
      savedAppointment = {
        id: "33333333-3333-4333-8333-333333333333",
        ...request.body,
      };
      request.reply({ statusCode: 201, body: savedAppointment });
    }).as("createAppointment");

    cy.visitWithSession();
    cy.get('[data-cy="app-shell"]').should("be.visible");
    cy.get('[data-cy="tab-agenda"]').click();

    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1);
    const dateValue = [
      appointmentDate.getFullYear(),
      String(appointmentDate.getMonth() + 1).padStart(2, "0"),
      String(appointmentDate.getDate()).padStart(2, "0"),
    ].join("-");
    const displayedDate = appointmentDate.toLocaleDateString("pt-BR");

    cy.get('[data-cy="schedule-date"]').type(dateValue);
    cy.get('[data-cy="schedule-time"]').select("10:00");
    cy.get('[data-cy="schedule-location"]').select("1");
    cy.get('[data-cy="schedule-submit"]').click();
    cy.get('[data-cy="confirmation-confirm"]').click();

    cy.wait("@createAppointment").then(({ request }) => {
      expect(request.body).to.deep.equal({
        user_id: "22222222-2222-4222-8222-222222222222",
        type: "Aferição de pressão",
        date: displayedDate,
        time: "10:00",
        location: "UPA Torrões",
        points: 30,
        confirmed: false,
      });
    });

    cy.contains('[data-cy="agenda-item"]', "Aferição de pressão").should(
      "be.visible"
    );
    cy.reload();
    cy.get('[data-cy="app-shell"]').should("be.visible");
    cy.get('[data-cy="tab-agenda"]').click();
    cy.wait("@loadAppointments");
    cy.contains('[data-cy="agenda-item"]', "Aferição de pressão")
      .should("be.visible")
      .and("contain", displayedDate)
      .and("contain", "UPA Torrões");
  });
});
