export default function AgendaScreen({ context }) {
  const { authMode, authForm, authError, handleAuthSubmit, setAuthForm, setAuthError, setAuthMode, nextAppointment, showDetails, handleQuickAction, daysUntilNextAppointment, nextAppointmentLocation, vitals, handleVitalsSubmit, setVitals, vitalsError, lastVitals, pressureStatus, glucoseStatus, vitalsHistory, selectedCard, points, pendingItems, activeAppointments, MAX_APPOINTMENTS, CoinIcon, totalPointsEarned, agenda, HEALTH_TIPS, limitReached, handleConfirmPresence, handleDeleteAppointment, handleScheduleSubmit, form, setForm, APPOINTMENT_TYPES, getMinDate, availableTimeSlots, RECIFE_HEALTH_LOCATIONS, setSelectedLocationId, setAppointmentError, appointmentError, selectedLocation, nextLevelProgress, rewardsLoaded, isSupabaseEnabled, rewards, handleRedeem } = context;
  return (
    <section className="panel panel-stack">
      <div className="panel-header">
        <h3>Sua Agenda</h3>

        <button
          className="mini-button"
          onClick={() => handleQuickAction("home")}
        >
          Voltar ao início
        </button>
      </div>

      <div className="status-banner">
        <span>Limite de agendamentos</span>
        <strong>
          {activeAppointments}/{MAX_APPOINTMENTS}
        </strong>
      </div>

      <div className="pending-panel">
        <div className="pending-head">
          <h4>Pendências</h4>
          <span className="pending-badge">{pendingItems.length}</span>
        </div>

        {pendingItems.length === 0 ? (
          <p className="empty-state">Nenhuma pendência por enquanto.</p>
        ) : (
          pendingItems.map((item) => (
            <div className="pending-item" key={item.id}>
              <div>
                <strong>{item.type}</strong>
                <p>
                  {item.date} às {item.time}
                </p>
              </div>

              <div className="pending-actions">
                <button
                  className="small-button success"
                  onClick={() => handleConfirmPresence(item.id)}
                >
                  Confirmar
                </button>

                <button
                  className="small-button danger"
                  onClick={() => handleDeleteAppointment(item.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form className="schedule-form" onSubmit={handleScheduleSubmit}>
        <div className="field-grid">
          <label>
            Tipo de atendimento
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value,
                }))
              }
            >
              {APPOINTMENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </label>

          <label>
            Data
            <input
              type="date"
              min={getMinDate()}
              value={form.date}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  date: event.target.value,
                  time: "",
                }))
              }
            />
          </label>

          <label>
            Horário
            <select
              value={form.time}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  time: event.target.value,
                }))
              }
              disabled={!form.date}
            >
              <option value="">
                {form.date ? "Selecione um horário" : "Escolha a data primeiro"}
              </option>
              {availableTimeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>

          <label>
            UPA
            <select
              value={form.locationId}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  locationId: event.target.value,
                }));
                setSelectedLocationId(event.target.value);
                setAppointmentError("");
              }}
            >
              <option value="">Selecione uma UPA</option>
              {RECIFE_HEALTH_LOCATIONS.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {form.date && availableTimeSlots.length === 0 && (
          <p className="location-error">
            Não há mais horários disponíveis hoje. Escolha outra data.
          </p>
        )}

        {appointmentError && (
          <p className="location-error">{appointmentError}</p>
        )}

        {selectedLocation && (
          <p className="selected-location-message">
            UPA selecionada: <strong>{selectedLocation.name}</strong> —{" "}
            {selectedLocation.area} · 📞 {selectedLocation.phone}
          </p>
        )}

        <button
          type="submit"
          className="primary-submit"
          disabled={limitReached}
        >
          {limitReached ? "Limite atingido" : "Agendar"}
        </button>
      </form>

      <div className="panel">
        <div className="panel-header">
          <h4>Unidades disponíveis</h4>
        </div>

        <div className="location-results">
          {RECIFE_HEALTH_LOCATIONS.map((place) => (
            <div className="location-result" key={place.id}>
              <strong>{place.name}</strong>
              <span>{place.area}</span>
              <span className="location-hours">
                {place.hours} · 📞 {place.phone}
              </span>
            </div>
          ))}
        </div>
      </div>

      {agenda.map((item) => (
        <div className="agenda-item" key={item.id}>
          <div className="agenda-head">
            <strong>{item.type}</strong>
            <span>{item.points} pts</span>
          </div>

          <p>
            {item.date} às {item.time}
          </p>

          <p className="agenda-location">{item.location}</p>

          <div className="agenda-actions">
            <button
              className="agenda-action secondary"
              onClick={() => handleConfirmPresence(item.id)}
              disabled={item.confirmed}
            >
              {item.confirmed ? "Confirmado" : "Confirmar presença"}
            </button>

            <button
              className="agenda-action ghost danger"
              onClick={() => handleDeleteAppointment(item.id)}
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
