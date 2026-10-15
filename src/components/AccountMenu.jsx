import { useState } from "react";
import { supabase } from "../lib/supabase";
import "../account.css";
export default function AccountMenu({ onClose, onLogout }) {
  const [page, setPage] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function changePassword(e) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (!supabase) throw new Error("Conexão indisponível.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword(""); setMessage("Senha atualizada.");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <div className="rv-settings-backdrop" onClick={onClose}><aside className="rv-settings" role="dialog" aria-modal="true" aria-label="Configurações da conta" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === "Escape") onClose(); }}>
    <button type="button" autoFocus onClick={onClose}>Fechar ×</button><h2>Configurações</h2>
    <button onClick={() => { setPage("security"); setError(""); setMessage(""); }}>Segurança</button>
    <button onClick={() => setPage("accessibility")}>Acessibilidade</button>
    <button onClick={() => setPage("about")}>Sobre o app</button>
    <button disabled title="Ainda não implementado">Notificações — em desenvolvimento</button>
    <button disabled title="Ainda não implementado">Preferências de saúde — em desenvolvimento</button>
    <button disabled title="Ainda não implementado">Privacidade — em desenvolvimento</button>
    <button onClick={onLogout}>Sair da conta</button>
    {page === "security" && <form onSubmit={changePassword}><h3>Trocar senha</h3><label>Nova senha<input type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} /></label><button type="submit" className="secondary" disabled={busy}>{busy ? "Salvando..." : "Atualizar senha"}</button>{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}</form>}
    {page === "accessibility" && <section><h3>Tamanho do texto</h3><button onClick={() => { document.documentElement.style.fontSize = "19px"; }}>Ampliar texto</button><button onClick={() => { document.documentElement.style.fontSize = ""; }}>Restaurar tamanho</button><p>Ajuste apenas para esta página; não é salvo na conta.</p></section>}
    {page === "about" && <section><h3>Recife Vital</h3><p>Acompanhe seus registros, agenda e recompensas no aplicativo.</p></section>}
  </aside></div>;
}
