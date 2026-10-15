import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../account.css";
const empty = { name: "", phone: "", birth_date: "", emergency_name: "", emergency_phone: "", emergency_relationship: "" };
export default function ProfileScreen({ onNameSaved }) {
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(empty);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!supabase) throw new Error("Conexão com o Supabase indisponível.");
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!auth.user) throw new Error("Entre novamente para acessar seu perfil.");
        const { data, error: profileError } = await supabase.from("profiles")
          .select("name,phone,birth_date,emergency_name,emergency_phone,emergency_relationship")
          .eq("id", auth.user.id).single();
        if (profileError) throw profileError;
        if (!active) return;
        const values = Object.fromEntries(Object.keys(empty).map(key => [key, data[key] ?? ""]));
        setUserId(auth.user.id); setEmail(auth.user.email || ""); setForm(values); setSaved(values);
      } catch (err) { if (active) setError(err.message); }
      finally { if (active) setBusy(false); }
    }
    load(); return () => { active = false; };
  }, []);
  async function save(event) {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try {
      if (!supabase || !userId) throw new Error("Perfil indisponível. Entre novamente.");
      if (!form.name.trim()) throw new Error("Informe seu nome.");
      const payload = { ...form, name: form.name.trim(), birth_date: form.birth_date || null };
      const { data, error: writeError } = await supabase.from("profiles").update(payload)
        .eq("id", userId).select("name,phone,birth_date,emergency_name,emergency_phone,emergency_relationship").single();
      if (writeError) throw writeError;
      const values = Object.fromEntries(Object.keys(empty).map(key => [key, data[key] ?? ""]));
      setForm(values); setSaved(values); setEditing(false); setMessage("Alterações salvas.");
      onNameSaved?.(data.name);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  const field = (key, label, type = "text") => <label>{label}<input type={type} value={form[key]} disabled={!editing || busy} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} /></label>;
  return <section className="panel rv-account">
    <h2>Meu perfil</h2><p>{email}</p>
    {error && <p role="alert" className="location-error">{error}</p>}
    {message && <p role="status">{message}</p>}
    {busy && <p role="status">Aguarde...</p>}
    <form onSubmit={save}>
      <h3>Dados pessoais</h3><div className="rv-account-grid">{field("name", "Nome")}{field("phone", "Telefone", "tel")}{field("birth_date", "Data de nascimento", "date")}</div>
      <h3>Contato de emergência</h3><div className="rv-account-grid">{field("emergency_name", "Nome do contato")}{field("emergency_phone", "Telefone do contato", "tel")}{field("emergency_relationship", "Parentesco")}</div>
      <div className="rv-account-actions">
  <button
    key="edit-profile"
    type="button"
    className="secondary"
    hidden={editing}
    disabled={busy || !userId}
    onClick={(event) => {
      event.preventDefault();
      setMessage("");
      setError("");
      setEditing(true);
    }}
  >
    Editar perfil
  </button>

  <button
    key="save-profile"
    type="submit"
    className="primary-submit"
    hidden={!editing}
    disabled={busy || !editing}
  >
    {busy ? "Salvando..." : "Salvar alterações"}
  </button>

  <button
    key="cancel-profile"
    type="button"
    className="ghost"
    hidden={!editing}
    disabled={busy}
    onClick={(event) => {
      event.preventDefault();
      setForm(saved);
      setEditing(false);
      setError("");
      setMessage("");
    }}
  >
    Cancelar
  </button>
</div>
    </form>
  </section>;
}
