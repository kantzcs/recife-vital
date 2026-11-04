import { useEffect, useState } from "react";
import { ArrowLeft, Bell, ChevronRight, HeartPulse, Info, Lock, LogOut, ShieldCheck, Type, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import "../account.css";

const SOON = [
  { icon: Bell, label: "Lembretes" },
  { icon: HeartPulse, label: "Preferências de saúde" },
  { icon: Lock, label: "Privacidade e dados" },
];

export default function AccountMenu({ onClose, onLogout }) {
  const [page, setPage] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Esc fecha o menu mesmo quando o foco sai do painel.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function changePassword(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!supabase) throw new Error("O app está sem conexão com o servidor no momento.");
      if (password.length < 6) throw new Error("Use pelo menos 6 caracteres.");
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword("");
      setMessage("Senha trocada. Use a nova no próximo acesso.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const open = (next) => {
    setPage(next);
    setError("");
    setMessage("");
  };

  const titles = { security: "Trocar senha", accessibility: "Tamanho do texto", about: "Sobre o Recife Vital" };

  return (
    <div className="rv-settings-backdrop" onClick={onClose}>
      <aside
        className="rv-settings"
        role="dialog"
        aria-modal="true"
        aria-label="Configurações"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="rv-settings-head">
          {page ? (
            <button type="button" className="icon-button" onClick={() => open("")} aria-label="Voltar">
              <ArrowLeft size={20} />
            </button>
          ) : null}
          <h2>{page ? titles[page] : "Configurações"}</h2>
          <button type="button" className="icon-button" autoFocus onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {!page && (
          <>
            <ul className="settings-list">
              <li>
                <button type="button" onClick={() => open("security")}>
                  <ShieldCheck aria-hidden="true" />
                  <span>Trocar senha</span>
                  <ChevronRight className="settings-arrow" aria-hidden="true" />
                </button>
              </li>
              <li>
                <button type="button" onClick={() => open("accessibility")}>
                  <Type aria-hidden="true" />
                  <span>Tamanho do texto</span>
                  <ChevronRight className="settings-arrow" aria-hidden="true" />
                </button>
              </li>
              <li>
                <button type="button" onClick={() => open("about")}>
                  <Info aria-hidden="true" />
                  <span>Sobre o app</span>
                  <ChevronRight className="settings-arrow" aria-hidden="true" />
                </button>
              </li>
            </ul>

            <p className="settings-section">Em breve</p>
            <ul className="settings-list">
              {SOON.map(({ icon: SoonIcon, label }) => (
                <li key={label}>
                  <button type="button" disabled>
                    <SoonIcon aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ul>

            <button type="button" className="settings-logout" onClick={onLogout}>
              <LogOut size={18} aria-hidden="true" />
              Sair da conta
            </button>
          </>
        )}

        {page === "security" && (
          <form onSubmit={changePassword}>
            <label>
              Nova senha
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button type="submit" className="primary-submit" disabled={busy}>
              {busy ? "Salvando…" : "Trocar senha"}
            </button>
            {error && <p role="alert" className="location-error">{error}</p>}
            {message && <p role="status" className="success-line">{message}</p>}
          </form>
        )}

        {page === "accessibility" && (
          <section className="settings-body">
            <p>Deixe as letras maiores se estiver difícil de ler.</p>
            <div className="segmented">
              <button type="button" onClick={() => { document.documentElement.style.fontSize = ""; }}>
                Normal
              </button>
              <button type="button" onClick={() => { document.documentElement.style.fontSize = "19px"; }}>
                Maior
              </button>
            </div>
            <p className="form-note">Vale só neste aparelho e volta ao normal quando a página recarrega.</p>
          </section>
        )}

        {page === "about" && (
          <section className="settings-body">
            <p>
              O Recife Vital ajuda quem acompanha hipertensão ou diabetes a organizar atendimentos nas
              UPAs, anotar pressão e glicemia e acompanhar a própria rotina de cuidado.
            </p>
            <p className="form-note">
              Projeto estudantil. Não substitui consulta nem orientação da sua equipe de saúde.
            </p>
          </section>
        )}
      </aside>
    </div>
  );
}
