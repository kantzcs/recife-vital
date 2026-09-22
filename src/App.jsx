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
    area: "Av. Abdias de Carvalho, 30, Torrões, Recife - PE",
    phone: "(81) 3184-4440",
    hours: "Aberto 24 horas, todos os dias",
  },
  {
    id: 2,
    name: "UPA Caxangá",
    category: "Urgência e emergência",
    area: "Av. Caxangá, s/n, Várzea, Recife - PE",
    phone: "(81) 3184-4366",
    hours: "Aberto 24 horas, todos os dias",
  },
  {
    id: 3,
    name: "UPA Ibura",
    category: "Urgência e emergência",
    area: "Rua Vale do Itajaí, s/n, Ibura, Recife - PE",
    phone: "(81) 3184-4595",
    hours: "Aberto 24 horas, todos os dias",
  },
  {
    id: 4,
    name: "UPA Imbiribeira",
    category: "Urgência e emergência",
    area: "Av. Mascarenhas de Morais, 4223, Imbiribeira, Recife - PE",
    phone: "(81) 3184-4328",
    hours: "Aberto 24 horas, todos os dias",
  },
];

const APPOINTMENT_TYPES = [
  { value: "Aferição de pressão", points: 30 },
  { value: "Controle glicêmico", points: 30 },
  { value: "Consulta HIPERDIA", points: 50 },
  { value: "Retirada de medicamento", points: 20 },
  { value: "Exame (hemoglobina glicada)", points: 40 },
];

const HEALTH_TIPS = [
  {
    id: 1,
    icon: "❤",
    title: "Meça a pressão regularmente",
    text: "Pessoas com hipertensão devem aferir a pressão em pelo menos duas ocasiões e anotar os valores para levar à consulta.",
  },
  {
    id: 2,
    icon: "🩸",
    title: "Monitore a glicemia",
    text: "Registre os valores de glicemia de jejum e pós-refeição; a meta usual é até 126 mg/dL em jejum.",
  },
  {
    id: 3,
    icon: "🍽",
    title: "Monte um prato equilibrado",
    text: "Metade do prato com vegetais, um quarto com proteína magra e um quarto com carboidratos integrais ajuda a controlar pressão e glicemia juntas.",
  },
  {
    id: 4,
    icon: "🚶",
    title: "Movimente-se todos os dias",
    text: "30 minutos de caminhada a maior parte dos dias da semana auxiliam no controle de ambas as condições.",
  },
  {
    id: 5,
    icon: "💊",
    title: "Não interrompa a medicação",
    text: "Tome os medicamentos nos horários indicados, mesmo se sentir bem, e nunca interrompa sem orientação médica.",
  },
];

const tabs = ["Início", "Agenda", "Recompensas"];

const OPENING_HOUR = 7;
const CLOSING_HOUR = 22;
const SLOT_STEP_MINUTES = 30;

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += SLOT_STEP_MINUTES) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const mapSupabaseAppointment = (appointment) => ({
  id: appointment.id,
  type: appointment.type,
  date: appointment.date,
  time: appointment.time,
  location: appointment.location,
  points: appointment.points ?? 0,
  confirmed: Boolean(appointment.confirmed),
});

const CoinIcon = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <circle cx="12" cy="12" r="9.5" fill="#F4B400" stroke="#C98A06" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6.8" fill="none" stroke="#C98A06" strokeWidth="1" strokeDasharray="1.4 1.6" />
    <text
      x="12"
      y="15.5"
      textAnchor="middle"
      fontSize="9"
      fontWeight="800"
      fill="#7A5300"
      fontFamily="Sora, sans-serif"
    >
      RV
    </text>
  </svg>
);

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

  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [authError, setAuthError] = useState("");
  const [profileId, setProfileId] = useState(null);

  const [form, setForm] = useState({
    type: APPOINTMENT_TYPES[0].value,
    date: "",
    time: "",
    locationId: "",
  });

  const [vitals, setVitals] = useState({
    systolic: "",
    diastolic: "",
    glucose: "",
  });
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [vitalsError, setVitalsError] = useState("");

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

  const selectedLocation = useMemo(
    () =>
      RECIFE_HEALTH_LOCATIONS.find(
        (place) => String(place.id) === String(form.locationId)
      ) ?? null,
    [form.locationId]
  );

  const nextAppointmentLocation = useMemo(() => {
    if (!agenda[0]) return null;
    return (
      RECIFE_HEALTH_LOCATIONS.find(
        (place) => place.name === agenda[0].location
      ) ?? null
    );
  }, [agenda]);

  const daysUntilNextAppointment = useMemo(() => {
    const next = agenda[0];
    if (!next) return null;

    const [day, month, year] = next.date.split("/");
    const target = new Date(`${year}-${month}-${day}T${next.time}:00`);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  }, [agenda]);

  const totalPointsEarned = useMemo(
    () =>
      agenda
        .filter((item) => item.confirmed)
        .reduce((sum, item) => sum + item.points, 0),
    [agenda]
  );

  const lastVitals = vitalsHistory[0] ?? null;

  const pressureStatus = useMemo(() => {
    if (!lastVitals) return null;
    const { systolic, diastolic } = lastVitals;
    if (systolic >= 140 || diastolic >= 90) return "alta";
    if (systolic >= 130 || diastolic >= 85) return "atenção";
    return "controlada";
  }, [lastVitals]);

  const glucoseStatus = useMemo(() => {
    if (!lastVitals || !lastVitals.glucose) return null;
    if (lastVitals.glucose >= 126) return "alta";
    if (lastVitals.glucose >= 100) return "atenção";
    return "controlada";
  }, [lastVitals]);

  const availableTimeSlots = useMemo(() => {
    if (!form.date) return TIME_SLOTS;

    const today = getMinDate();
    if (form.date !== today) return TIME_SLOTS;

    const now = new Date();
    return TIME_SLOTS.filter((slot) => {
      const [hh, mm] = slot.split(":").map(Number);
      const slotDate = new Date();
      slotDate.setHours(hh, mm, 0, 0);
      return slotDate > now;
    });
  }, [form.date]);

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

  function getMinDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const isDateTimeValid = (date, time) => {
    if (!date || !time) return false;

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
    setSelectedLocationId("");
    setVitalsHistory([]);
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

    const selectedType = APPOINTMENT_TYPES.find(
      (item) => item.value === form.type
    );
    const earnedPoints = selectedType ? selectedType.points : 30;

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

  const handleVitalsSubmit = (event) => {
    event.preventDefault();
    setVitalsError("");

    const systolic = Number(vitals.systolic);
    const diastolic = Number(vitals.diastolic);
    const glucose = vitals.glucose ? Number(vitals.glucose) : null;

    if (!systolic || !diastolic) {
      setVitalsError("Informe ao menos a pressão sistólica e a diastólica.");
      return;
    }

    if (systolic < 60 || systolic > 260 || diastolic < 40 || diastolic > 160) {
      setVitalsError("Verifique os valores de pressão informados.");
      return;
    }

    const entry = {
      id: Date.now(),
      systolic,
      diastolic,
      glucose,
      recordedAt: new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setVitalsHistory((current) => [entry, ...current].slice(0, 10));
    setVitals({ systolic: "", diastolic: "", glucose: "" });
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
        type: APPOINTMENT_TYPES[0].value,
        date: "",
        time: "",
        locationId: "",
      });
      setSelectedLocationId("");
      setAppointmentError("");
      setConfirmation(null);
    }
  };

  const nextAppointment = agenda[0] ?? null;

  const renderAuthScreen = () => (
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

  const renderHome = () => (
    <>
      <section className="hero-card">
        <div className="hero-header">
          <span className="tag">PRÓXIMO ATENDIMENTO</span>

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
            : "Sem atendimento agendado"}
        </h2>

        <p className="home-location">
          {nextAppointment
            ? nextAppointment.location
            : "Agende sua próxima aferição ou consulta HIPERDIA"}
        </p>

        {nextAppointment && daysUntilNextAppointment !== null && (
          <p className="home-countdown">
            {daysUntilNextAppointment <= 0
              ? "É hoje!"
              : daysUntilNextAppointment === 1
                ? "Falta 1 dia"
                : `Faltam ${daysUntilNextAppointment} dias`}
          </p>
        )}

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

            {nextAppointmentLocation && (
              <p>
                📞 Telefone: {nextAppointmentLocation.phone}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Registrar minhas medidas</h3>
        </div>

        <form className="vitals-form" onSubmit={handleVitalsSubmit}>
          <div className="field-grid">
            <label>
              Pressão sistólica
              <input
                type="number"
                inputMode="numeric"
                placeholder="Ex: 120"
                value={vitals.systolic}
                onChange={(event) =>
                  setVitals((current) => ({
                    ...current,
                    systolic: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Pressão diastólica
              <input
                type="number"
                inputMode="numeric"
                placeholder="Ex: 80"
                value={vitals.diastolic}
                onChange={(event) =>
                  setVitals((current) => ({
                    ...current,
                    diastolic: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Glicemia (mg/dL)
              <input
                type="number"
                inputMode="numeric"
                placeholder="Opcional"
                value={vitals.glucose}
                onChange={(event) =>
                  setVitals((current) => ({
                    ...current,
                    glucose: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          {vitalsError && <p className="location-error">{vitalsError}</p>}

          <button type="submit" className="secondary vitals-submit">
            Salvar registro
          </button>
        </form>

        {lastVitals && (
          <div className="vitals-summary">
            <div className={`vitals-badge ${pressureStatus}`}>
              <span role="img" aria-label="Pressão">❤</span>
              <div>
                <strong>
                  {lastVitals.systolic}/{lastVitals.diastolic} mmHg
                </strong>
                <small>Pressão {pressureStatus}</small>
              </div>
            </div>

            {lastVitals.glucose && (
              <div className={`vitals-badge ${glucoseStatus}`}>
                <span role="img" aria-label="Glicemia">🩸</span>
                <div>
                  <strong>{lastVitals.glucose} mg/dL</strong>
                  <small>Glicemia {glucoseStatus}</small>
                </div>
              </div>
            )}
          </div>
        )}

        {vitalsHistory.length > 0 && (
          <div className="vitals-history">
            <h4>Histórico recente</h4>
            {vitalsHistory.map((entry) => (
              <div className="vitals-history-item" key={entry.id}>
                <span>{entry.recordedAt}</span>
                <strong>
                  {entry.systolic}/{entry.diastolic} mmHg
                  {entry.glucose ? ` · ${entry.glucose} mg/dL` : ""}
                </strong>
              </div>
            ))}
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
          <span role="img" aria-label="Agendar">📅</span>
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
          <span role="img" aria-label="Recompensas">🎁</span>
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
          <span role="img" aria-label="Resumo">📊</span>
          <strong>Resumo</strong>
        </button>
      </section>

      <section className="stats-grid">
        <button
          className="stat-card points"
          onClick={() => handleQuickAction("rewards")}
        >
          <span className="icon-badge"><CoinIcon /></span>
          <strong>{points} pts</strong>
          <small>Saldo Recife Saudável</small>
        </button>

        <button
          className="stat-card blue"
          onClick={() => handleQuickAction("agenda")}
        >
          <span role="img" aria-label="Pendências">⏳</span>
          <strong>{pendingItems.length}</strong>
          <small>Pendências em aberto</small>
        </button>

        <button
          className="stat-card green"
          onClick={() => handleQuickAction("agenda")}
        >
          <span role="img" aria-label="Atendimentos ativos">🩺</span>
          <strong>
            {Math.min(activeAppointments, MAX_APPOINTMENTS)}/
            {MAX_APPOINTMENTS}
          </strong>
          <small>Atendimentos ativos</small>
        </button>

        <button
          className="stat-card red"
          onClick={() => handleQuickAction("agenda")}
        >
          <span role="img" aria-label="Status">✅</span>
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

      <section className="panel">
        <div className="panel-header">
          <h3>Seu progresso</h3>
        </div>

        <div className="progress-summary">
          <div>
            <strong>{totalPointsEarned}</strong>
            <small>pontos ganhos com presenças confirmadas</small>
          </div>

          <div>
            <strong>{agenda.filter((item) => item.confirmed).length}</strong>
            <small>atendimentos concluídos</small>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Dicas para hipertensão e diabetes</h3>
        </div>

        <div className="tips-list">
          {HEALTH_TIPS.map((tip) => (
            <div className="tip-item" key={tip.id}>
              <span role="img" aria-label={tip.title}>{tip.icon}</span>
              <div>
                <strong>{tip.title}</strong>
                <p>{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
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
            Tipo de atendimento
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value,
                }))
              }
            >
              {APPOINTMENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value}
                </option>
              ))}
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
                  time: "",
                }))
              }
            />
          </label>

          <label>
            Horário
            <select
              value={form.time}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  time: event.target.value,
                }))
              }
              disabled={!form.date}
            >
              <option value="">
                {form.date ? "Selecione um horário" : "Escolha a data primeiro"}
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
                setForm((current) => ({
                  ...current,
                  locationId: event.target.value,
                }));
                setSelectedLocationId(event.target.value);
                setAppointmentError("");
              }}
            >
              <option value="">Selecione uma UPA</option>
              {RECIFE_HEALTH_LOCATIONS.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {form.date && availableTimeSlots.length === 0 && (
          <p className="location-error">
            Não há mais horários disponíveis hoje. Escolha outra data.
          </p>
        )}

        {appointmentError && (
          <p className="location-error">{appointmentError}</p>
        )}

        {selectedLocation && (
          <p className="selected-location-message">
            UPA selecionada: <strong>{selectedLocation.name}</strong> —{" "}
            {selectedLocation.area} · 📞 {selectedLocation.phone}
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

      <div className="panel">
        <div className="panel-header">
          <h4>Unidades disponíveis</h4>
        </div>

        <div className="location-results">
          {RECIFE_HEALTH_LOCATIONS.map((place) => (
            <div className="location-result" key={place.id}>
              <strong>{place.name}</strong>
              <span>{place.area}</span>
              <span className="location-hours">
                {place.hours} · 📞 {place.phone}
              </span>
            </div>
          ))}
        </div>
      </div>

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

  if (!isLoggedIn) {
    return renderAuthScreen();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Recife Vital · HIPERDIA</p>
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