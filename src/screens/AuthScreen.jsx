export default function AuthScreen({ context }) {
  const { authMode, authForm, authError, handleAuthSubmit, setAuthForm, setAuthError, setAuthMode, nextAppointment, showDetails, handleQuickAction, daysUntilNextAppointment, nextAppointmentLocation, vitals, handleVitalsSubmit, setVitals, vitalsError, lastVitals, pressureStatus, glucoseStatus, vitalsHistory, selectedCard, points, pendingItems, activeAppointments, MAX_APPOINTMENTS, CoinIcon, totalPointsEarned, agenda, HEALTH_TIPS, limitReached, handleConfirmPresence, handleDeleteAppointment, handleScheduleSubmit, form, setForm, APPOINTMENT_TYPES, getMinDate, availableTimeSlots, RECIFE_HEALTH_LOCATIONS, setSelectedLocationId, setAppointmentError, appointmentError, selectedLocation, nextLevelProgress, rewardsLoaded, isSupabaseEnabled, rewards, handleRedeem } = context;
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <p className="eyebrow">Recife Vital · HIPERDIA</p>
          <h2>{authMode === "login" ? "Entrar" : "Criar conta"}</h2>
        </div>

        <form className="auth-form" onSubmit={handleAuthSubmit}>
          {authError && <p className="location-error">{authError}</p>}

          {authMode === "signup" && (
            <label>
              Nome
              <input
                type="text"
                value={authForm.name}
                onChange={(event) =>
                  setAuthForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Seu nome"
                required
              />
            </label>
          )}

          <label>
            E-mail
            <input
              type="email"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="seuemail@exemplo.com"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Sua senha"
              required
            />
          </label>

          {authMode === "signup" && (
            <label>
              Confirmar senha
              <input
                type="password"
                value={authForm.confirmPassword}
                onChange={(event) =>
                  setAuthForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Repita sua senha"
                required
              />
            </label>
          )}

          <button type="submit" className="primary-submit auth-submit">
            {authMode === "login" ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <p className="auth-hint">
          {authMode === "login"
            ? "Entre para acompanhar sua pressão, glicemia, agenda e recompensas."
            : "Crie sua conta para registrar suas medidas e acumular pontos."}
        </p>

        <div className="auth-switch">
          <span>
            {authMode === "login"
              ? "Ainda não tem conta?"
              : "Já tem uma conta?"}
          </span>

          <button
            type="button"
            className="link-button"
            onClick={() => {
              setAuthError("");
              setAuthMode((current) =>
                current === "login" ? "signup" : "login"
              );
            }}
          >
            {authMode === "login" ? "Cadastre-se" : "Fazer login"}
          </button>
        </div>
      </div>
    </div>
  );
}
