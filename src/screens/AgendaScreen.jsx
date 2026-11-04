import { CheckCircle2, Clock, MapPin, Phone } from "lucide-react";
import { formatAppointment } from "../lib/format.js";

export default function AgendaScreen({ context }) {
  const {
    pendingItems,
    activeAppointments,
    MAX_APPOINTMENTS,
    agenda,
    limitReached,
    handleConfirmPresence,
    handleDeleteAppointment,
    handleScheduleSubmit,
    form,
    setForm,
    APPOINTMENT_TYPES,
    getMinDate,
    availableTimeSlots,
    RECIFE_HEALTH_LOCATIONS,
    setSelectedLocationId,
    setAppointmentError,
    appointmentError,
    selectedLocation,
  } = context;

  const done = agenda.filter((item) => item.confirmed);
  const phoneHref = (phone) => `tel:${phone.replace(/\D/g, "")}`;

  return (
    <>
      <section className="panel">
        <div className="panel-header">
          <h3>Próximos</h3>
          <span className="count-label">
            {activeAppointments} de {MAX_APPOINTMENTS}
          </span>
        </div>

        {pendingItems.length === 0 ? (
          <p className="empty-state">
            Sua agenda está livre. Use o formulário abaixo pra marcar um atendimento.
          </p>
        ) : (
          <ul className="row-list">
            {pendingItems.map((item) => (
              <li className="row-item" key={item.id}>
                <Clock className="row-icon" aria-hidden="true" />
                <div className="row-main">
                  <strong>{formatAppointment(item.date, item.time)}</strong>
                  <p>
                    {item.type} · {item.location}
                  </p>
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="small-button success"
                    onClick={() => handleConfirmPresence(item.id)}
                  >
                    Eu fui
                  </button>
                  <button
                    type="button"
                    className="small-button danger"
                    onClick={() => handleDeleteAppointment(item.id)}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Marcar atendimento</h3>
        </div>

        <form className="schedule-form" onSubmit={handleScheduleSubmit}>
          <div className="field-grid">
            <label>
              O que você vai fazer
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value }))
                }
              >
                {APPOINTMENT_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value} ({item.points} fichas)
                  </option>
                ))}
              </select>
            </label>

            <label>
              Dia
              <input
                type="date"
                min={getMinDate()}
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, date: event.target.value, time: "" }))
                }
              />
            </label>

            <label>
              Horário
              <select
                value={form.time}
                onChange={(event) =>
                  setForm((current) => ({ ...current, time: event.target.value }))
                }
                disabled={!form.date}
              >
                <option value="">
                  {form.date ? "Escolha o horário" : "Escolha o dia antes"}
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
                  setForm((current) => ({ ...current, locationId: event.target.value }));
                  setSelectedLocationId(event.target.value);
                  setAppointmentError("");
                }}
              >
                <option value="">Escolha a unidade</option>
                {RECIFE_HEALTH_LOCATIONS.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {form.date && availableTimeSlots.length === 0 && (
            <p className="location-error">Os horários de hoje já acabaram. Escolha outro dia.</p>
          )}

          {appointmentError && <p className="location-error">{appointmentError}</p>}

          {selectedLocation && (
            <p className="selected-location-message">
              <MapPin size={16} aria-hidden="true" />
              <span>
                <strong>{selectedLocation.name}</strong> · {selectedLocation.area}
              </span>
            </p>
          )}

          <button type="submit" className="primary-submit" disabled={limitReached}>
            {limitReached ? "Sua agenda está cheia" : "Continuar"}
          </button>
          <p className="form-note">
            O atendimento fica registrado no app. Pra garantir a vaga, ligue pra UPA.
          </p>
        </form>
      </section>

      {done.length > 0 && (
        <section className="panel">
          <div className="panel-header">
            <h3>Já fui</h3>
          </div>
          <ul className="row-list">
            {done.map((item) => (
              <li className="row-item muted" key={item.id}>
                <CheckCircle2 className="row-icon done" aria-hidden="true" />
                <div className="row-main">
                  <strong>{formatAppointment(item.date, item.time)}</strong>
                  <p>
                    {item.type} · {item.location}
                  </p>
                </div>
                <span className="row-points">+{item.points} fichas</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <h3>UPAs da rede</h3>
        </div>
        <ul className="row-list">
          {RECIFE_HEALTH_LOCATIONS.map((place) => (
            <li className="row-item upa-row" key={place.id}>
              <MapPin className="row-icon" aria-hidden="true" />
              <div className="row-main">
                <strong>{place.name}</strong>
                <p>{place.area}</p>
                <p className="row-meta">{place.hours}</p>
              </div>
              <a className="small-button" href={phoneHref(place.phone)}>
                <Phone size={14} aria-hidden="true" />
                {place.phone}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
