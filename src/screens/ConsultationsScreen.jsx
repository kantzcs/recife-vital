export default function ConsultationsScreen({ context }) {
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

      <section className="panel">
        <div className="panel-header">
          <h3>Registrar minhas medidas</h3>
        </div>

        <form className="vitals-form" onSubmit={handleVitalsSubmit}>
          <div className="field-grid">
            <label>
              Pressão sistólica
              <input
                type="number"
                inputMode="numeric"
                placeholder="Ex: 120"
                value={vitals.systolic}
                onChange={(event) =>
                  setVitals((current) => ({
                    ...current,
                    systolic: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Pressão diastólica
              <input
                type="number"
                inputMode="numeric"
                placeholder="Ex: 80"
                value={vitals.diastolic}
                onChange={(event) =>
                  setVitals((current) => ({
                    ...current,
                    diastolic: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Glicemia (mg/dL)
              <input
                type="number"
                inputMode="numeric"
                placeholder="Opcional"
                value={vitals.glucose}
                onChange={(event) =>
                  setVitals((current) => ({
                    ...current,
                    glucose: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          {vitalsError && <p className="location-error">{vitalsError}</p>}

          <button type="submit" className="secondary vitals-submit">
            Salvar registro
          </button>
        </form>

        {lastVitals && (
          <div className="vitals-summary">
            <div className={`vitals-badge ${pressureStatus}`}>
              <span role="img" aria-label="Pressão">❤</span>
              <div>
                <strong>
                  {lastVitals.systolic}/{lastVitals.diastolic} mmHg
                </strong>
                <small>Pressão {pressureStatus}</small>
              </div>
            </div>

            {lastVitals.glucose && (
              <div className={`vitals-badge ${glucoseStatus}`}>
                <span role="img" aria-label="Glicemia">🩸</span>
                <div>
                  <strong>{lastVitals.glucose} mg/dL</strong>
                  <small>Glicemia {glucoseStatus}</small>
                </div>
              </div>
            )}
          </div>
        )}

        {vitalsHistory.length > 0 && (
          <div className="vitals-history">
            <h4>Histórico recente</h4>
            {vitalsHistory.map((entry) => (
              <div className="vitals-history-item" key={entry.id}>
                <span>{entry.recordedAt}</span>
                <strong>
                  {entry.systolic}/{entry.diastolic} mmHg
                  {entry.glucose ? ` · ${entry.glucose} mg/dL` : ""}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>


    </>
  );
}
