import { useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase } from "./lib/supabase";
import "./styles.css";

const MAX_APPOINTMENTS = 4;

const initialAgenda = [];

const initialRewards = [
  {
    id: 1,
    icon: "🚌",
    title: "Crédito no VEM",
    cost: 200,
    redeemed: false,
  },
  {
    id: 2,
    icon: "🎬",
    title: "Ingresso Cinema/Teatro",
    cost: 150,
    redeemed: false,
  },
  {
    id: 3,
    icon: "📚",
    title: "Vaga em Curso COMPAZ",
    cost: 300,
    redeemed: false,
  },
];

const RECIFE_HEALTH_LOCATIONS = [
  {
    id: 1,
    name: "UPA Torrões",
    category: "Urgência e emergência",
    area: "Rua Mirabela, 30, Torrões, Recife - PE",
    hours: "Aberto 24 horas, todos os dias",
  },
  {
    id: 2,
    name: "UPA Caxangá",
    category: "Urgência e emergência",
    area: "Avenida Caxangá, Iputinga, Recife - PE",
    hours: "Aberto 24 horas, todos os dias",
  },
  {
    id: 3,
    name: "UPA Ibura",
    category: "Urgência e emergência",
    area: "Ibura, Recife - PE",
    hours: "Aberto 24 horas, todos os dias",
  },
];

const tabs = ["Início", "Agenda", "Recompensas"];

const normalizeLocationText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const mapSupabaseAppointment = (appointment) => ({
  id: appointment.id,
  type: appointment.type,
  date: appointment.date,
  time: appointment.time,
  location: appointment.location,
  points: appointment.points ?? 0,
  confirmed: Boolean(appointment.confirmed),
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [activeTab, setActiveTab] = useState("Início");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCard, setSelectedCard] = useState("home");

  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState(initialRewards);
  const [rewardsLoaded, setRewardsLoaded] = useState(false);

  const [agenda, setAgenda] = useState(initialAgenda);
  const [confirmation, setConfirmation] = useState(null);

  const [locationResults, setLocationResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [authError, setAuthError] = useState("");
  const [profileId, setProfileId] = useState(null);

  const [form, setForm] = useState({
    type: "Consulta",
    date: "",
    time: "",
    location: "",
  });

  const isSupabaseEnabled = hasSupabaseConfig && Boolean(supabase);

  const pendingItems = useMemo(
    () => agenda.filter((item) => !item.confirmed),
    [agenda]
  );

  const activeAppointments = agenda.length;
  const limitReached = activeAppointments >= MAX_APPOINTMENTS;

  const nextLevelProgress = useMemo(
    () => Math.min((points / 500) * 100, 100),
    [points]
  );

  const openConfirmation = (type, payload = {}) => {
    setConfirmation({ type, ...payload });
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(`${value}T12:00:00`);

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const isDateTimeValid = (date, time) => {
    if (!date || !time || time.length !== 5) return false;

    const appointmentDateTime = new Date(`${date}T${time}:00`);
    return appointmentDateTime > new Date();
  };

  const syncAgendaFromSupabase = async (userId) => {
    if (!isSupabaseEnabled || !supabase || !userId) return;

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setAppointmentError("Não foi possível carregar seus agendamentos.");
      return;
    }

    setAgenda((data ?? []).map(mapSupabaseAppointment));
  };

  const syncRewardsFromSupabase = async (userId) => {
    if (!isSupabaseEnabled || !supabase || !userId) {
      setRewardsLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from("user_rewards")
      .select("points, redeemed_rewards")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      setAppointmentError(
        "Não foi possível carregar seus pontos. Verifique a tabela user_rewards no Supabase."
      );
      setRewardsLoaded(true);
      return;
    }

    if (!data) {
      const { error: insertError } = await supabase
        .from("user_rewards")
        .insert({
          user_id: userId,
          points: 0,
          redeemed_rewards: [],
        });

      if (insertError) {
        setAppointmentError(
          "Não foi possível criar seu saldo. Verifique as políticas da tabela user_rewards."
        );
      }

      setPoints(0);
      setRewards(initialRewards);
      setRewardsLoaded(true);
      return;
    }

    const redeemedIds = Array.isArray(data.redeemed_rewards)
      ? data.redeemed_rewards
      : [];

    setPoints(data.points ?? 0);

    setRewards(
      initialRewards.map((reward) => ({
        ...reward,
        redeemed: redeemedIds.includes(reward.id),
      }))
    );

    setRewardsLoaded(true);
  };

  const saveRewardsToSupabase = async (nextPoints, nextRewards) => {
    if (!isSupabaseEnabled || !supabase || !profileId) {
      return true;
    }

    const redeemedIds = nextRewards
      .filter((reward) => reward.redeemed)
      .map((reward) => reward.id);

    const { error } = await supabase.from("user_rewards").upsert(
      {
        user_id: profileId,
        points: nextPoints,
        redeemed_rewards: redeemedIds,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      setAppointmentError(
        "Não foi possível salvar os pontos no Supabase. Tente novamente."
      );
      return false;
    }

    return true;
  };

  const ensureSupabaseProfile = async (userId, userName, userEmail) => {
    if (!isSupabaseEnabled || !supabase || !userId) return;

    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      setAuthError("Não foi possível acessar o perfil no Supabase.");
      return;
    }

    if (!existingProfile) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        name: userName || userEmail?.split("@")[0] || "Usuário",
        email: userEmail,
      });

      if (insertError) {
        setAuthError("Não foi possível criar o perfil no Supabase.");
        return;
      }
    }

    setProfileId(userId);
    await syncAgendaFromSupabase(userId);
    await syncRewardsFromSupabase(userId);
  };

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseEnabled || !supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const user = session.user;

      setAuthForm((current) => ({
        ...current,
        email: user.email ?? "",
        name: user.user_metadata?.name ?? "",
      }));

      await ensureSupabaseProfile(
        user.id,
        user.user_metadata?.name,
        user.email
      );

      setIsLoggedIn(true);
    };

    checkSession();
  }, [isSupabaseEnabled]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");

    if (!authForm.email.trim() || !authForm.password) {
      setAuthError("Informe e-mail e senha para continuar.");
      return;
    }

    if (authMode === "signup") {
      if (!authForm.name.trim() || !authForm.confirmPassword) {
        setAuthError("Preencha todos os campos para criar a conta.");
        return;
      }

      if (authForm.password !== authForm.confirmPassword) {
        setAuthError("As senhas não conferem.");
        return;
      }
    }

    if (!isSupabaseEnabled || !supabase) {
      if (authMode === "signup") {
        setIsLoggedIn(true);
        setAuthForm((current) => ({
          ...current,
          password: "",
          confirmPassword: "",
        }));
        return;
      }

      const isTestAccount =
        authForm.email.trim().toLowerCase() === "usuario@recifevital.com" &&
        authForm.password === "123456";

      if (!isTestAccount) {
        setAuthError(
          "Conta não encontrada. Use usuario@recifevital.com e senha 123456 ou crie uma conta."
        );
        return;
      }

      setIsLoggedIn(true);
      setAuthForm((current) => ({
        ...current,
        name: current.name || "Usuário",
        password: "",
        confirmPassword: "",
      }));
      return;
    }

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: authForm.email.trim(),
          password: authForm.password,
          options: {
            data: {
              name: authForm.name.trim(),
            },
          },
        });

        if (error) {
          setAuthError(error.message);
          return;
        }

        const user = data.user;

        if (user) {
          await ensureSupabaseProfile(
            user.id,
            user.user_metadata?.name || authForm.name,
            user.email
          );

          setIsLoggedIn(true);
        }

        setAuthForm((current) => ({
          ...current,
          password: "",
          confirmPassword: "",
        }));

        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authForm.email.trim(),
        password: authForm.password,
      });

      if (error) {
        setAuthError("Não foi possível fazer login. Verifique as credenciais.");
        return;
      }

      const user = data.user;

      if (user) {
        setAuthForm((current) => ({
          ...current,
          name: user.user_metadata?.name || current.name || "Usuário",
          email: user.email ?? current.email,
          password: "",
          confirmPassword: "",
        }));

        await ensureSupabaseProfile(
          user.id,
          user.user_metadata?.name,
          user.email
        );

        setIsLoggedIn(true);
      }
    } catch {
      setAuthError("Não foi possível conectar ao Supabase.");
    }
  };

  const handleLogout = async () => {
    if (isSupabaseEnabled && supabase) {
      await supabase.auth.signOut();
    }

    setIsLoggedIn(false);
    setAuthMode("login");
    setProfileId(null);
    setAgenda(initialAgenda);
    setPoints(0);
    setRewards(initialRewards);
    setRewardsLoaded(false);
    setLocationResults([]);
    setSelectedLocation(null);
    setAuthForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setAuthError("");
    setAppointmentError("");
  };

  const handleQuickAction = (action) => {
    setSelectedCard(action);

    if (action === "details") {
      setShowDetails((value) => !value);
      return;
    }

    if (action === "agenda") {
      setActiveTab("Agenda");
      return;
    }

    if (action === "rewards") {
      setActiveTab("Recompensas");
      return;
    }

    setActiveTab("Início");
  };

  const handleLocationSearch = () => {
    const query = form.location.trim();

    setLocationError("");
    setSelectedLocation(null);

    if (!query) {
      setLocationResults(RECIFE_HEALTH_LOCATIONS);
      return;
    }

    const normalizedQuery = normalizeLocationText(query);

    const filtered = RECIFE_HEALTH_LOCATIONS.filter((place) => {
      const searchText = `${place.name} ${place.category} ${place.area}`;
      return normalizeLocationText(searchText).includes(normalizedQuery);
    });

    setLocationResults(filtered);

    if (!filtered.length) {
      setLocationError(
        "Nenhuma UPA foi encontrada. Pesquise por Torrões, Caxangá ou Ibura."
      );
    }
  };

  const handleTimeChange = (event) => {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length > 2) {
      value = `${value.slice(0, 2)}:${value.slice(2, 4)}`;
    }

    setForm((current) => ({
      ...current,
      time: value.slice(0, 5),
    }));
  };

  const handleTimeBlur = () => {
    if (!form.time) return;

    if (form.time.length !== 5) {
      setAppointmentError("Hora inválida. Use o formato HH:MM.");
      return;
    }

    const [hours, minutes] = form.time.split(":");
    const hour = Number(hours);
    const minute = Number(minutes);

    if (hour > 23 || minute > 59) {
      setAppointmentError("Hora inválida. Use valores entre 00:00 e 23:59.");
      return;
    }

    setAppointmentError("");
  };

  const handleScheduleSubmit = (event) => {
    event.preventDefault();
    setAppointmentError("");

    if (!form.date || !form.time || !selectedLocation) {
      openConfirmation("validation", {
        title: "Dados incompletos",
        message:
          "Informe data, horário e selecione uma UPA da lista antes de confirmar.",
      });
      return;
    }

    if (!isDateTimeValid(form.date, form.time)) {
      setAppointmentError(
        "A data e o horário devem ser posteriores ao momento atual."
      );
      return;
    }

    if (limitReached) {
      openConfirmation("limit", {
        title: "Limite de consultas atingido",
        message: `Você já possui ${activeAppointments} atendimentos ativos. Exclua um para criar outro.`,
      });
      return;
    }

    const earnedPoints =
      form.type === "Consulta"
        ? 50
        : form.type === "Retirada"
          ? 30
          : 40;

    openConfirmation("schedule", {
      title: "Confirmar agendamento",
      message: `Deseja criar ${form.type} para ${formatDate(form.date)} às ${form.time}?`,
      payload: {
        type: form.type,
        date: formatDate(form.date),
        time: form.time,
        location: selectedLocation.name,
        points: earnedPoints,
      },
    });
  };

  const handleConfirmPresence = (id) => {
    const selected = agenda.find((item) => item.id === id);

    if (!selected || selected.confirmed) return;

    openConfirmation("presence", {
      id,
      title: "Confirmar presença",
      message: `Deseja confirmar sua presença em ${selected.type} de ${selected.date}? Você receberá ${selected.points} pontos.`,
    });
  };

  const handleDeleteAppointment = (id) => {
    const selected = agenda.find((item) => item.id === id);

    if (!selected) return;

    openConfirmation("delete", {
      id,
      title: "Excluir agendamento",
      message: `Essa ação remove ${selected.type} de ${selected.date} e não pode ser desfeita.`,
    });
  };

  const handleRedeem = async (rewardId) => {
    const selected = rewards.find((item) => item.id === rewardId);

    if (!selected || selected.redeemed || points < selected.cost) {
      return;
    }

    const nextPoints = points - selected.cost;

    const nextRewards = rewards.map((item) =>
      item.id === rewardId
        ? { ...item, redeemed: true }
        : item
    );

    setPoints(nextPoints);
    setRewards(nextRewards);

    const saved = await saveRewardsToSupabase(nextPoints, nextRewards);

    if (!saved) {
      setPoints(points);
      setRewards(rewards);
    }
  };

  const handleConfirmationAction = async () => {
    if (!confirmation) return;

    if (confirmation.type === "validation" || confirmation.type === "limit") {
      setConfirmation(null);
      return;
    }

    if (confirmation.type === "presence") {
      const selected = agenda.find((item) => item.id === confirmation.id);

      if (!selected || selected.confirmed) {
        setConfirmation(null);
        return;
      }

      if (isSupabaseEnabled && supabase && profileId) {
        const { error } = await supabase
          .from("appointments")
          .update({ confirmed: true })
          .eq("id", confirmation.id)
          .eq("user_id", profileId);

        if (error) {
          setAppointmentError(
            "Não foi possível confirmar a presença no Supabase."
          );
          setConfirmation(null);
          return;
        }
      }

      const nextPoints = points + selected.points;
      const nextAgenda = agenda.map((item) =>
        item.id === confirmation.id
          ? { ...item, confirmed: true }
          : item
      );

      setAgenda(nextAgenda);
      setPoints(nextPoints);

      const saved = await saveRewardsToSupabase(nextPoints, rewards);

      if (!saved) {
        setPoints(points);
        setAgenda(agenda);
        setConfirmation(null);
        return;
      }

      if (isSupabaseEnabled && profileId) {
        await syncAgendaFromSupabase(profileId);
      }

      setConfirmation(null);
      return;
    }

    if (confirmation.type === "delete") {
      if (isSupabaseEnabled && supabase && profileId) {
        const { error } = await supabase
          .from("appointments")
          .delete()
          .eq("id", confirmation.id)
          .eq("user_id", profileId);

        if (error) {
          setAppointmentError(
            "Não foi possível excluir o agendamento no Supabase."
          );
          setConfirmation(null);
          return;
        }

        await syncAgendaFromSupabase(profileId);
      } else {
        setAgenda((current) =>
          current.filter((item) => item.id !== confirmation.id)
        );
      }

      setConfirmation(null);
      return;
    }

    if (confirmation.type === "schedule") {
      const nextItem = {
        id: Date.now(),
        ...confirmation.payload,
        confirmed: false,
      };

      if (isSupabaseEnabled && supabase && profileId) {
        const { data, error } = await supabase
          .from("appointments")
          .insert({
            user_id: profileId,
            type: confirmation.payload.type,
            date: confirmation.payload.date,
            time: confirmation.payload.time,
            location: confirmation.payload.location,
            points: confirmation.payload.points,
            confirmed: false,
          })
          .select()
          .single();

        if (error) {
          setAppointmentError(
            "Não foi possível salvar o agendamento no Supabase."
          );
          setConfirmation(null);
          return;
        }

        setAgenda((current) => [
          mapSupabaseAppointment(data),
          ...current,
        ]);
      } else {
        setAgenda((current) => [nextItem, ...current]);
      }

      setActiveTab("Agenda");
      setSelectedCard("agenda");
      setForm({
        type: "Consulta",
        date: "",
        time: "",
        location: "",
      });
      setSelectedLocation(null);
      setLocationResults([]);
      setLocationError("");
      setConfirmation(null);
    }
  };

  const nextAppointment = agenda[0] ?? null;

  const renderAuthScreen = () => (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <p className="eyebrow">Recife Vital</p>
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
            ? "Entre para acompanhar sua agenda, pontos e recompensas."
            : "Crie sua conta para registrar atendimentos e acumular pontos."}
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

  const renderHome = () => (
    <>
      <section className="hero-card">
        <div className="hero-header">
          <span className="tag">PRÓXIMA CONSULTA</span>

          <button
            className="mini-button"
            onClick={() => handleQuickAction("details")}
          >
            {showDetails ? "Ocultar detalhes" : "Ver detalhes"}
          </button>
        </div>

        <h2>
          {nextAppointment
            ? `${nextAppointment.date} - ${nextAppointment.time}`
            : "Sem consulta agendada"}
        </h2>

        <p className="home-location">
          {nextAppointment
            ? nextAppointment.location
            : "Defina uma UPA para o seu próximo atendimento"}
        </p>

        {showDetails && (
          <div className="details-box">
            <p>
              {nextAppointment
                ? "Atendimento agendado. Compareça no horário informado."
                : "Ainda não há atendimento cadastrado."}
            </p>

            <p>
              {nextAppointment
                ? `${nextAppointment.type} em ${nextAppointment.location}.`
                : "Abra a agenda para realizar seu primeiro agendamento."}
            </p>
          </div>
        )}
      </section>

      <section className="quick-actions">
        <button
          className={
            selectedCard === "agenda"
              ? "quick-card active"
              : "quick-card"
          }
          onClick={() => handleQuickAction("agenda")}
        >
          <span>📅</span>
          <strong>Agendar</strong>
        </button>

        <button
          className={
            selectedCard === "rewards"
              ? "quick-card active"
              : "quick-card"
          }
          onClick={() => handleQuickAction("rewards")}
        >
          <span>🎁</span>
          <strong>Recompensas</strong>
        </button>

        <button
          className={
            selectedCard === "home"
              ? "quick-card active"
              : "quick-card"
          }
          onClick={() => handleQuickAction("home")}
        >
          <span>📊</span>
          <strong>Resumo</strong>
        </button>
      </section>

      <section className="stats-grid">
        <button
          className="stat-card points"
          onClick={() => handleQuickAction("rewards")}
        >
          <span>🪙</span>
          <strong>{points} pts</strong>
          <small>Saldo Recife Saudável</small>
        </button>

        <button
          className="stat-card blue"
          onClick={() => handleQuickAction("agenda")}
        >
          <span>⏳</span>
          <strong>{pendingItems.length}</strong>
          <small>Pendências em aberto</small>
        </button>

        <button
          className="stat-card green"
          onClick={() => handleQuickAction("agenda")}
        >
          <span>🩺</span>
          <strong>
            {Math.min(activeAppointments, MAX_APPOINTMENTS)}/
            {MAX_APPOINTMENTS}
          </strong>
          <small>Consultas ativas</small>
        </button>

        <button
          className="stat-card red"
          onClick={() => handleQuickAction("agenda")}
        >
          <span>✅</span>
          <strong>
            {pendingItems.length === 0
              ? "Tudo ok"
              : `${pendingItems.length} pendente${
                  pendingItems.length === 1 ? "" : "s"
                }`}
          </strong>
          <small>Controle de atenções</small>
        </button>
      </section>
    </>
  );

  const renderAgenda = () => (
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
            Tipo
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value,
                }))
              }
            >
              <option value="Consulta">Consulta</option>
              <option value="Retirada">Retirada</option>
              <option value="Exame">Exame</option>
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
                }))
              }
            />
          </label>

          <label>
            Horário
            <input
              type="text"
              value={form.time}
              onChange={handleTimeChange}
              onBlur={handleTimeBlur}
              placeholder="HH:MM"
              maxLength={5}
              className="time-input"
            />
          </label>

          <label>
            Local
            <input
              type="text"
              value={form.location}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  location: event.target.value,
                }));
                setSelectedLocation(null);
                setLocationResults([]);
                setLocationError("");
              }}
              placeholder="Pesquise e selecione uma UPA"
            />
          </label>
        </div>

        <div className="location-controls">
          <button
            type="button"
            className="secondary location-search"
            onClick={handleLocationSearch}
          >
            Buscar UPA
          </button>
        </div>

        {locationError && (
          <p className="location-error">{locationError}</p>
        )}

        {appointmentError && (
          <p className="location-error">{appointmentError}</p>
        )}

        {locationResults.length > 0 && (
          <div className="location-results">
            {locationResults.map((place) => (
              <button
                type="button"
                key={place.id}
                className="location-result"
                onClick={() => {
                  setForm((current) => ({
                    ...current,
                    location: place.name,
                  }));
                  setSelectedLocation(place);
                  setLocationResults([]);
                  setLocationError("");
                }}
              >
                <strong>{place.name}</strong>
                <span>{place.category}</span>
                <span>{place.area}</span>
                <span className="location-hours">
                  Horário: {place.hours}
                </span>
              </button>
            ))}
          </div>
        )}

        {selectedLocation && (
          <p className="selected-location-message">
            UPA selecionada: <strong>{selectedLocation.name}</strong> —{" "}
            {selectedLocation.hours}
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

  const renderRewards = () => (
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
            <span>{reward.icon}</span>

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

  if (!isLoggedIn) {
    return renderAuthScreen();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Recife Vital</p>
          <h1>Olá, {authForm.name || "usuário"}!</h1>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <nav className="tab-nav" aria-label="Navegação principal">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === "Início" && renderHome()}
        {activeTab === "Agenda" && renderAgenda()}
        {activeTab === "Recompensas" && renderRewards()}
      </main>

      {confirmation && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmation(null)}
        >
          <div
            className="confirmation-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h4>{confirmation.title}</h4>
            <p>{confirmation.message}</p>

            <div className="modal-actions">
              <button
                className="ghost"
                onClick={() => setConfirmation(null)}
              >
                Cancelar
              </button>

              <button
                className="primary-submit"
                onClick={handleConfirmationAction}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}