import { CalendarDays, Coins, HeartPulse, LineChart } from "lucide-react";

export default function AuthScreen({ context }) {
  const { authMode, authForm, authError, handleAuthSubmit, setAuthForm, setAuthError, setAuthMode } = context;

  const isLogin = authMode === "login";
  const update = (key) => (event) =>
    setAuthForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div className="auth-shell">
      <aside className="auth-side">
        <div className="brand brand-light">
          <span className="brand-mark" aria-hidden="true">
            <HeartPulse size={22} strokeWidth={2.25} />
          </span>
          <span className="brand-name">Recife Vital</span>
        </div>

        <div className="auth-side-copy">
          <h1>Seu cuidado, no seu ritmo.</h1>
          <p>Pra quem acompanha pressão alta ou diabetes pelas UPAs do Recife.</p>
        </div>

        <ul className="auth-points">
          <li>
            <CalendarDays aria-hidden="true" />
            Organize seus atendimentos do HIPERDIA
          </li>
          <li>
            <LineChart aria-hidden="true" />
            Anote pressão e glicemia em segundos
          </li>
          <li>
            <Coins aria-hidden="true" />
            Ganhe fichas vitais por cada atendimento
          </li>
        </ul>
      </aside>

      <main className="auth-card">
        <div className="auth-brand">
          <div className="brand auth-mobile-brand">
            <span className="brand-mark" aria-hidden="true">
              <HeartPulse size={20} strokeWidth={2.25} />
            </span>
            <span className="brand-name">Recife Vital</span>
          </div>
          <h2>{isLogin ? "Que bom te ver de novo" : "Criar sua conta"}</h2>
          <p className="auth-tagline">
            {isLogin ? "Entre com seu e-mail e senha." : "Leva menos de um minuto."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleAuthSubmit}>
          {authError && <p className="location-error" role="alert">{authError}</p>}

          {!isLogin && (
            <label>
              Como podemos te chamar?
              <input
                type="text"
                autoComplete="given-name"
                value={authForm.name}
                onChange={update("name")}
                required
              />
            </label>
          )}

          <label>
            E-mail
            <input
              type="email"
              autoComplete="email"
              value={authForm.email}
              onChange={update("email")}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={authForm.password}
              onChange={update("password")}
              required
            />
          </label>

          {!isLogin && (
            <label>
              Repita a senha
              <input
                type="password"
                autoComplete="new-password"
                value={authForm.confirmPassword}
                onChange={update("confirmPassword")}
                required
              />
            </label>
          )}

          <button type="submit" className="primary-submit auth-submit">
            {isLogin ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="auth-switch">
          <span>{isLogin ? "Primeira vez aqui?" : "Já tem conta?"}</span>
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setAuthError("");
              setAuthMode((current) => (current === "login" ? "signup" : "login"));
            }}
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </div>
      </main>
    </div>
  );
}
