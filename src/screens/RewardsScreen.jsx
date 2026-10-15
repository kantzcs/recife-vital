export default function RewardsScreen({ context }) {
  const { authMode, authForm, authError, handleAuthSubmit, setAuthForm, setAuthError, setAuthMode, nextAppointment, showDetails, handleQuickAction, daysUntilNextAppointment, nextAppointmentLocation, vitals, handleVitalsSubmit, setVitals, vitalsError, lastVitals, pressureStatus, glucoseStatus, vitalsHistory, selectedCard, points, pendingItems, activeAppointments, MAX_APPOINTMENTS, CoinIcon, totalPointsEarned, agenda, HEALTH_TIPS, limitReached, handleConfirmPresence, handleDeleteAppointment, handleScheduleSubmit, form, setForm, APPOINTMENT_TYPES, getMinDate, availableTimeSlots, RECIFE_HEALTH_LOCATIONS, setSelectedLocationId, setAppointmentError, appointmentError, selectedLocation, nextLevelProgress, rewardsLoaded, isSupabaseEnabled, rewards, handleRedeem } = context;
  return (
    <section className="panel rewards-panel">
      <div className="rewards-header">
        <h3>Recompensas</h3>
        <div className="points-box">{points} pts</div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${nextLevelProgress}%` }}
        />
      </div>

      <small>{points}/500 para o próximo nível</small>

      {!rewardsLoaded && isSupabaseEnabled && (
        <p className="empty-state">Carregando pontos e recompensas...</p>
      )}

      {rewards.map((reward) => {
        const isDisabled = reward.redeemed || points < reward.cost;

        return (
          <div className="reward-item" key={reward.id}>
            <span role="img" aria-label={reward.title}>{reward.icon}</span>

            <div className="reward-text">
              <strong>{reward.title}</strong>
              <small>{reward.cost} pts</small>
            </div>

            <button
              className={isDisabled ? "locked" : ""}
              onClick={() => handleRedeem(reward.id)}
              disabled={isDisabled}
            >
              {reward.redeemed
                ? "Resgatado"
                : points < reward.cost
                  ? `Faltam ${reward.cost - points} pts`
                  : "Resgatar"}
            </button>
          </div>
        );
      })}
    </section>
  );
}
