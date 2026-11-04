import { Activity, CalendarPlus, ChevronRight, Coins, MapPin, Phone } from "lucide-react";
import { formatAppointment, greeting, parseBrDate } from "../lib/format.js";

export default function HomeScreen({ context }) {
  const {
    userName,
    nextAppointment,
    showDetails,
    handleQuickAction,
    nextAppointmentLocation,
    points,
    pendingItems,
    activeAppointments,
    MAX_APPOINTMENTS,
    totalPointsEarned,
    agenda,
    HEALTH_TIPS,
  } = context;

  const completed = agenda.filter((item) => item.confirmed).length;

  // Contagem por dia do calendário. "Hoje" e "Amanhã" já aparecem no título.
  const target = nextAppointment ? parseBrDate(nextAppointment.date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = target ? Math.round((target - today) / 86400000) : null;
  const countdown = daysLeft !== null && daysLeft > 1 ? `Faltam ${daysLeft} dias` : null;

  return (
    <>
      <section className="home-greeting">
        <h2>
          {greeting()}
          {userName ? `, ${userName}` : ""}.
        </h2>
        <p>
          {pendingItems.length === 0
            ? "Nada pendente por aqui."
            : pendingItems.length === 1
              ? "Você tem 1 atendimento pra confirmar."
              : `Você tem ${pendingItems.length} atendimentos pra confirmar.`}
        </p>
      </section>

      <section className="hero-card" aria-labelledby="next-appointment-title">
        <div className="hero-header">
          <span className="tag">Próximo atendimento</span>
          {nextAppointment && countdown && (
            <span className="hero-countdown">{countdown}</span>
          )}
        </div>

        {nextAppointment ? (
          <>
            <h2 id="next-appointment-title">
              {formatAppointment(nextAppointment.date, nextAppointment.time)}
            </h2>
            <p className="hero-type">{nextAppointment.type}</p>
            <p className="home-location">
              <MapPin size={16} aria-hidden="true" />
              {nextAppointment.location}
            </p>

            {showDetails && nextAppointmentLocation && (
              <div className="details-box">
                <p>{nextAppointmentLocation.area}</p>
                <p>{nextAppointmentLocation.hours}</p>
                <p>
                  <Phone size={14} aria-hidden="true" />
                  <a href={`tel:${nextAppointmentLocation.phone.replace(/\D/g, "")}`}>
                    {nextAppointmentLocation.phone}
                  </a>
                </p>
              </div>
            )}

            <button
              type="button"
              className="link-button hero-toggle"
              aria-expanded={showDetails}
              onClick={() => handleQuickAction("details")}
            >
              {showDetails ? "Esconder endereço" : "Ver endereço e telefone"}
            </button>
          </>
        ) : (
          <>
            <h2 id="next-appointment-title">Nenhum atendimento marcado</h2>
            <p className="home-location">
              Marque uma aferição de pressão ou consulta do HIPERDIA numa UPA perto de você.
            </p>
            <button
              type="button"
              className="primary-submit hero-cta"
              onClick={() => handleQuickAction("agenda")}
            >
              Marcar atendimento
            </button>
          </>
        )}
      </section>

      <section className="quick-actions" aria-label="Atalhos">
        <button className="quick-card" type="button" onClick={() => handleQuickAction("agenda")}>
          <CalendarPlus aria-hidden="true" />
          <span>
            <strong>Novo atendimento</strong>
            <small>
              {activeAppointments}/{MAX_APPOINTMENTS} marcados
            </small>
          </span>
          <ChevronRight className="quick-arrow" aria-hidden="true" />
        </button>

        <button className="quick-card" type="button" onClick={() => handleQuickAction("vitals")}>
          <Activity aria-hidden="true" />
          <span>
            <strong>Registrar medida</strong>
            <small>Pressão e glicemia</small>
          </span>
          <ChevronRight className="quick-arrow" aria-hidden="true" />
        </button>

        <button className="quick-card coins" type="button" onClick={() => handleQuickAction("rewards")}>
          <Coins aria-hidden="true" />
          <span>
            <strong>{points} fichas vitais</strong>
            <small>Ver recompensas</small>
          </span>
          <ChevronRight className="quick-arrow" aria-hidden="true" />
        </button>
      </section>

      {completed > 0 && (
        <section className="panel progress-line">
          <p>
            Você já foi a <strong>{completed}</strong>{" "}
            {completed === 1 ? "atendimento" : "atendimentos"} e ganhou{" "}
            <strong>{totalPointsEarned} fichas</strong> com isso.
          </p>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <h3>Pra cuidar no dia a dia</h3>
        </div>

        <ul className="tips-list">
          {HEALTH_TIPS.map(({ id, icon: TipIcon, title, text }) => (
            <li className="tip-item" key={id}>
              <TipIcon aria-hidden="true" />
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="tips-note">
          Essas dicas são gerais. Siga sempre a orientação da sua equipe de saúde.
        </p>
      </section>
    </>
  );
}
