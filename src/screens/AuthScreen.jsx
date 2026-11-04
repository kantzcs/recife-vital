import { CalendarDays, Coins, HeartPulse, LineChart } from "lucide-react";

// O botão só aparece depois que o Google estiver configurado no Supabase
// e a variável VITE_GOOGLE_AUTH_ENABLED=true estiver na Vercel.
const GOOGLE_ENABLED = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === "true";

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export default function AuthScreen({ context }) {
  const { authMode, authForm, authError, handleAuthSubmit, setAuthForm, setAuthError, setAuthMode, handleGoogleLogin, googleBusy } = context;

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
            {isLogin
              ? GOOGLE_ENABLED ? "Escolha como prefere entrar." : "Entre com seu e-mail e senha."
              : "Leva menos de um minuto."}
          </p>
        </div>

        {authError && <p className="location-error auth-error" role="alert">{authError}</p>}

        {GOOGLE_ENABLED && (
          <>
            <button
              type="button"
              className="google-button"
              onClick={handleGoogleLogin}
              disabled={googleBusy}
            >
              <GoogleMark />
              {googleBusy ? "Abrindo o Google…" : "Continuar com o Google"}
            </button>
            <p className="auth-divider">ou com e-mail</p>
          </>
        )}

        <form className="auth-form" onSubmit={handleAuthSubmit}>

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

        <p className="auth-legal">
          Ao entrar, você concorda com os{" "}
          <a href="/termos/" target="_blank" rel="noopener">Termos de Uso</a> e a{" "}
          <a href="/privacidade/" target="_blank" rel="noopener">Política de Privacidade</a>.
        </p>
      </main>
    </div>
  );
}
