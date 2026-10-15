export default function HomeScreen({ context }) {
  const { authMode, authForm, authError, handleAuthSubmit, setAuthForm, setAuthError, setAuthMode, nextAppointment, showDetails, handleQuickAction, daysUntilNextAppointment, nextAppointmentLocation, vitals, handleVitalsSubmit, setVitals, vitalsError, lastVitals, pressureStatus, glucoseStatus, vitalsHistory, selectedCard, points, pendingItems, activeAppointments, MAX_APPOINTMENTS, CoinIcon, totalPointsEarned, agenda, HEALTH_TIPS, limitReached, handleConfirmPresence, handleDeleteAppointment, handleScheduleSubmit, form, setForm, APPOINTMENT_TYPES, getMinDate, availableTimeSlots, RECIFE_HEALTH_LOCATIONS, setSelectedLocationId, setAppointmentError, appointmentError, selectedLocation, nextLevelProgress, rewardsLoaded, isSupabaseEnabled, rewards, handleRedeem } = context;
  return (
    <>
      <section className="hero-card">
        <div className="hero-header">
          <span className="tag">PRÓXIMO ATENDIMENTO</span>

          <button
            className="mini-button"
            onClick={() => handleQuickAction("details")}
          >
            {showDetails ? "Ocultar detalhes" : "Ver detalhes"}
          </button>
        </div>

        <h2>
          {nextAppointment
            ? `${nextAppointment.date} - ${nextAppointment.time}`
            : "Sem atendimento agendado"}
        </h2>

        <p className="home-location">
          {nextAppointment
            ? nextAppointment.location
            : "Agende sua próxima aferição ou consulta HIPERDIA"}
        </p>

        {nextAppointment && daysUntilNextAppointment !== null && (
          <p className="home-countdown">
            {daysUntilNextAppointment <= 0
              ? "É hoje!"
              : daysUntilNextAppointment === 1
                ? "Falta 1 dia"
                : `Faltam ${daysUntilNextAppointment} dias`}
          </p>
        )}

        {showDetails && (
          <div className="details-box">
            <p>
              {nextAppointment
                ? "Atendimento agendado. Compareça no horário informado."
                : "Ainda não há atendimento cadastrado."}
            </p>

            <p>
              {nextAppointment
                ? `${nextAppointment.type} em ${nextAppointment.location}.`
                : "Abra a agenda para realizar seu primeiro agendamento."}
            </p>

            {nextAppointmentLocation && (
              <p>
                📞 Telefone: {nextAppointmentLocation.phone}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="quick-actions">
        <button
          className={
            selectedCard === "agenda"
              ? "quick-card active"
              : "quick-card"
          }
          onClick={() => handleQuickAction("agenda")}
        >
          <span role="img" aria-label="Agendar">📅</span>
          <strong>Agendar</strong>
        </button>

        <button
          className={
            selectedCard === "rewards"
              ? "quick-card active"
              : "quick-card"
          }
          onClick={() => handleQuickAction("rewards")}
        >
          <span role="img" aria-label="Recompensas">🎁</span>
          <strong>Recompensas</strong>
        </button>

        <button
          className={
            selectedCard === "home"
              ? "quick-card active"
              : "quick-card"
          }
          onClick={() => handleQuickAction("home")}
        >
          <span role="img" aria-label="Resumo">📊</span>
          <strong>Resumo</strong>
        </button>
      </section>

      <section className="stats-grid">
        <button
          className="stat-card points"
          onClick={() => handleQuickAction("rewards")}
        >
          <span className="icon-badge"><CoinIcon /></span>
          <strong>{points} pts</strong>
          <small>Saldo Recife Saudável</small>
        </button>

        <button
          className="stat-card blue"
          onClick={() => handleQuickAction("agenda")}
        >
          <span role="img" aria-label="Pendências">⏳</span>
          <strong>{pendingItems.length}</strong>
          <small>Pendências em aberto</small>
        </button>

        <button
          className="stat-card green"
          onClick={() => handleQuickAction("agenda")}
        >
          <span role="img" aria-label="Atendimentos ativos">🩺</span>
          <strong>
            {Math.min(activeAppointments, MAX_APPOINTMENTS)}/
            {MAX_APPOINTMENTS}
          </strong>
          <small>Atendimentos ativos</small>
        </button>

        <button
          className="stat-card red"
          onClick={() => handleQuickAction("agenda")}
        >
          <span role="img" aria-label="Status">✅</span>
          <strong>
            {pendingItems.length === 0
              ? "Tudo ok"
              : `${pendingItems.length} pendente${
                  pendingItems.length === 1 ? "" : "s"
                }`}
          </strong>
          <small>Controle de atenções</small>
        </button>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Seu progresso</h3>
        </div>

        <div className="progress-summary">
          <div>
            <strong>{totalPointsEarned}</strong>
            <small>pontos ganhos com presenças confirmadas</small>
          </div>

          <div>
            <strong>{agenda.filter((item) => item.confirmed).length}</strong>
            <small>atendimentos concluídos</small>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Dicas para hipertensão e diabetes</h3>
        </div>

        <div className="tips-list">
          {HEALTH_TIPS.map((tip) => (
            <div className="tip-item" key={tip.id}>
              <span role="img" aria-label={tip.title}>{tip.icon}</span>
              <div>
                <strong>{tip.title}</strong>
                <p>{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
