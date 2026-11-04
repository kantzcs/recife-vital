import { useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase } from "./lib/supabase";
import "./tokens.css";
import "./styles.css";
import "./theme.css";
import { Activity, Bus, BookOpen, CalendarDays, Check, Coins, House, UserRound, Clapperboard, Droplet, Footprints, HeartPulse, MoreVertical, Pill, Salad } from "lucide-react";
import { formatAppointment } from "./lib/format.js";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import AccountMenu from "./components/AccountMenu.jsx";
import AuthScreen from "./screens/AuthScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import AgendaScreen from "./screens/AgendaScreen.jsx";
import RewardsScreen from "./screens/RewardsScreen.jsx";
import ConsultationsScreen from "./screens/ConsultationsScreen.jsx";

const MAX_APPOINTMENTS = 4;

const initialAgenda = [];

const initialRewards = [
  {
    id: 1,
    icon: Bus,
    title: "Crédito no VEM",
    detail: "Recarga no cartão de transporte",
    cost: 200,
    redeemed: false,
  },
  {
    id: 2,
    icon: Clapperboard,
    title: "Ingresso de cinema ou teatro",
    detail: "Sessão em espaço cultural da cidade",
    cost: 150,
    redeemed: false,
  },
  {
    id: 3,
    icon: BookOpen,
    title: "Vaga em curso no Compaz",
    detail: "Cursos livres nos centros Compaz",
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
    icon: HeartPulse,
    title: "Meça a pressão regularmente",
    text: "Anote cada aferição com data e horário. Levar esse histórico pra consulta ajuda o médico a ajustar o tratamento.",
  },
  {
    id: 2,
    icon: Droplet,
    title: "Registre a glicemia",
    text: "Anote se foi em jejum ou depois de comer. O mesmo número significa coisas diferentes em cada caso.",
  },
  {
    id: 3,
    icon: Salad,
    title: "Monte um prato equilibrado",
    text: "Metade do prato com verduras e legumes, um quarto com proteína e um quarto com arroz, feijão ou outro carboidrato.",
  },
  {
    id: 4,
    icon: Footprints,
    title: "Mexa o corpo todo dia",
    text: "Uma caminhada de 30 minutos na maior parte da semana já ajuda no controle da pressão e da glicemia.",
  },
  {
    id: 5,
    icon: Pill,
    title: "Não pare o remédio por conta própria",
    text: "Mesmo se estiver se sentindo bem, tome nos horários certos e só mude com orientação médica.",
  },
];

const TAB_ICONS = {
  Início: House,
  Agenda: CalendarDays,
  Medidas: Activity,
  Recompensas: Coins,
  Perfil: UserRound,
};

const tabs = ["Início", "Agenda", "Medidas", "Recompensas", "Perfil"];

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


export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visualNotice, setVisualNotice] = useState(null);
  const notify = (message) => setVisualNotice(message);

  useEffect(() => {
    if (!visualNotice) return undefined;
    const timer = setTimeout(() => setVisualNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [visualNotice]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
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
      setAppointmentError("Não conseguimos carregar sua agenda. Atualize a página para tentar de novo.");
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
        "Não conseguimos carregar suas fichas vitais. Atualize a página."
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
          "Não conseguimos abrir seu saldo de fichas. Tente entrar de novo."
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
      setAppointmentError("Sua sessão expirou. Entre de novo para salvar.");
      return false;
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
        "Não conseguimos salvar suas fichas. Nada mudou no saldo; tente de novo."
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
      setAuthError("Não conseguimos abrir seu perfil. Tente entrar de novo.");
      return;
    }

    if (!existingProfile) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        name: userName || userEmail?.split("@")[0] || "Usuário",
        email: userEmail,
      });

      if (insertError) {
        setAuthError("Sua conta foi criada, mas o perfil não. Tente entrar de novo.");
        return;
      }
    }

    setProfileId(userId);
    await syncAgendaFromSupabase(userId);
    await syncRewardsFromSupabase(userId);
  };

  useEffect(() => {
    const checkSession = async () => {
      // Volta do Google com erro (ex.: a pessoa cancelou na tela de contas).
      const params = new URLSearchParams(
        window.location.search || window.location.hash.replace(/^#/, "")
      );
      const oauthError = params.get("error_description") || params.get("error");
      const cameFromRedirect = ["code", "access_token", "error"].some((key) => params.has(key));

      if (cameFromRedirect) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      if (oauthError) {
        setAuthError("Não deu pra entrar com o Google. Tente de novo ou use e-mail e senha.");
      }

      if (!isSupabaseEnabled || !supabase) {
        setSessionChecked(true);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setSessionChecked(true);
        return;
      }

      const user = session.user;
      // O Google manda o nome em "name" ou "full_name".
      const displayName = user.user_metadata?.name || user.user_metadata?.full_name || "";

      setAuthForm((current) => ({
        ...current,
        email: user.email ?? "",
        name: displayName,
      }));

      await ensureSupabaseProfile(user.id, displayName, user.email);

      setIsLoggedIn(true);
      setSessionChecked(true);
    };

    checkSession();
  }, [isSupabaseEnabled]);

  const handleGoogleLogin = async () => {
    setAuthError("");

    if (!isSupabaseEnabled || !supabase) {
      setAuthError("O app está sem conexão com o servidor no momento.");
      return;
    }

    setGoogleBusy(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });

    // Se deu certo, o navegador já foi pro Google e esta linha não importa.
    if (error) {
      setAuthError("Não deu pra abrir o login do Google. Tente de novo.");
      setGoogleBusy(false);
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");

    if (!authForm.email.trim() || !authForm.password) {
      setAuthError("Preencha e-mail e senha.");
      return;
    }

    if (authMode === "signup") {
      if (!authForm.name.trim() || !authForm.confirmPassword) {
        setAuthError("Preencha todos os campos pra criar sua conta.");
        return;
      }

      if (authForm.password !== authForm.confirmPassword) {
        setAuthError("As senhas não conferem.");
        return;
      }
    }

    if (!isSupabaseEnabled || !supabase) {
      setAuthError("O app está sem conexão com o servidor no momento.");
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

        if (!data.session) {
          setAuthError("Conta criada. Confirme seu e-mail pelo link que enviamos e depois entre aqui.");
          setAuthMode("login");
          setAuthForm((current) => ({ ...current, password: "", confirmPassword: "" }));
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
        setAuthError(error.message);
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
      setAuthError("Não conseguimos conectar. Confira sua internet e tente de novo.");
    }
  };

  const handleLogout = async () => {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAppointmentError("Não conseguimos encerrar sua sessão. Tente de novo.");
        setMenuOpen(false);
        return;
      }
    }

    setMenuOpen(false);
    setVisualNotice(null);
    setConfirmation(null);
    setActiveTab("Início");
    setShowDetails(false);
    setSelectedCard("home");
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

    if (action === "vitals") {
      setActiveTab("Medidas");
      return;
    }

    setActiveTab("Início");
  };

  const handleScheduleSubmit = (event) => {
    event.preventDefault();
    setAppointmentError("");

    if (!form.date || !form.time || !selectedLocation) {
      openConfirmation("validation", {
        title: "Faltou alguma coisa",
        message: "Escolha a data, o horário e a UPA antes de continuar.",
        confirmLabel: "Entendi",
        single: true,
      });
      return;
    }

    if (!isDateTimeValid(form.date, form.time)) {
      setAppointmentError(
        "Esse horário já passou. Escolha um horário a partir de agora."
      );
      return;
    }

    if (limitReached) {
      openConfirmation("limit", {
        title: "Agenda cheia",
        message: `Você já tem ${activeAppointments} atendimentos marcados, o máximo permitido. Conclua ou remova um pra marcar outro.`,
        confirmLabel: "Entendi",
        single: true,
      });
      return;
    }

    const selectedType = APPOINTMENT_TYPES.find(
      (item) => item.value === form.type
    );
    const earnedPoints = selectedType ? selectedType.points : 30;

    openConfirmation("schedule", {
      title: "Marcar atendimento?",
      message: `${form.type} na ${selectedLocation.name}, ${formatAppointment(formatDate(form.date), form.time, { inline: true })}. Isso fica registrado no app; a UPA não recebe esse agendamento automaticamente.`,
      confirmLabel: "Marcar",
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
      title: "Você foi ao atendimento?",
      message: `${selected.type}, ${formatAppointment(selected.date, selected.time, { inline: true })}. Ao confirmar, você ganha ${selected.points} fichas vitais.`,
      confirmLabel: "Sim, eu fui",
    });
  };

  const handleDeleteAppointment = (id) => {
    const selected = agenda.find((item) => item.id === id);

    if (!selected) return;

    openConfirmation("delete", {
      id,
      title: "Remover atendimento?",
      message: `${selected.type}, ${formatAppointment(selected.date, selected.time, { inline: true })}, sai da sua agenda. Não dá pra desfazer.`,
      confirmLabel: "Remover",
      danger: true,
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
    } else {
      notify("Resgate feito. As fichas já saíram do seu saldo.");
    }
  };

  const handleVitalsSubmit = (event) => {
    event.preventDefault();
    setVitalsError("");

    const systolic = Number(vitals.systolic);
    const diastolic = Number(vitals.diastolic);
    const glucose = vitals.glucose ? Number(vitals.glucose) : null;

    if (!systolic || !diastolic) {
      setVitalsError("Preencha os dois números da pressão.");
      return;
    }

    if (systolic < 60 || systolic > 260 || diastolic < 40 || diastolic > 160) {
      setVitalsError("Esses valores de pressão parecem fora do normal. Confira se digitou certo.");
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
    if (["schedule", "presence", "delete"].includes(confirmation.type) &&
        (!isSupabaseEnabled || !supabase || !profileId)) {
      setAppointmentError("Sua sessão expirou. Entre de novo; nada foi salvo.");
      setConfirmation(null);
      return;
    }

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
            "Não conseguimos confirmar a presença. Tente de novo."
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

      notify("Presença confirmada. As fichas entraram no seu saldo.");
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
            "Não conseguimos remover o atendimento. Tente de novo."
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
            "Não conseguimos marcar o atendimento. Confira sua internet e tente de novo."
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

      notify("Atendimento marcado na sua agenda.");
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





  const userName = (authForm.name || "").trim().split(" ")[0];

  const context = { userName, handleGoogleLogin, googleBusy, authMode, authForm, authError, handleAuthSubmit, setAuthForm, setAuthError, setAuthMode, nextAppointment, showDetails, handleQuickAction, daysUntilNextAppointment, nextAppointmentLocation, vitals, handleVitalsSubmit, setVitals, vitalsError, lastVitals, pressureStatus, glucoseStatus, vitalsHistory, selectedCard, points, pendingItems, activeAppointments, MAX_APPOINTMENTS, totalPointsEarned, agenda, HEALTH_TIPS, limitReached, handleConfirmPresence, handleDeleteAppointment, handleScheduleSubmit, form, setForm, APPOINTMENT_TYPES, getMinDate, availableTimeSlots, RECIFE_HEALTH_LOCATIONS, setSelectedLocationId, setAppointmentError, appointmentError, selectedLocation, nextLevelProgress, rewardsLoaded, isSupabaseEnabled, rewards, handleRedeem };

  if (!sessionChecked) {
    return (
      <div className="splash" role="status" aria-live="polite">
        <span className="brand-mark" aria-hidden="true">
          <HeartPulse size={22} strokeWidth={2.25} />
        </span>
        <span className="sr-only">Abrindo o Recife Vital…</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AuthScreen context={context} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <HeartPulse size={20} strokeWidth={2.25} />
          </span>
          <span className="brand-name">Recife Vital</span>
        </div>

        <button
          type="button"
          className="rv-menu-button"
          aria-label="Abrir configurações"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MoreVertical size={22} />
        </button>
      </header>

      {menuOpen && (
        <AccountMenu
          onClose={() => setMenuOpen(false)}
          onLogout={handleLogout}
        />
      )}

      <nav className="tab-nav" aria-label="Navegação principal">
        {tabs.map((tab) => {
          const TabIcon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              className={activeTab === tab ? "tab active" : "tab"}
              type="button"
              aria-current={activeTab === tab ? "page" : undefined}
              onClick={() => {
                setMenuOpen(false);
                setActiveTab(tab);
              }}
            >
              <span className="tab-icon" aria-hidden="true"><TabIcon /></span>
              {tab}
            </button>
          );
        })}
      </nav>

      <main className="content">
        {activeTab === "Início" && <HomeScreen context={context} />}
        {appointmentError && <p role="alert" className="location-error">{appointmentError}</p>}
        {activeTab === "Medidas" && <ConsultationsScreen context={context} />}
        {activeTab === "Perfil" && (
          <ProfileScreen
            onNameSaved={(name) =>
              setAuthForm((current) => ({ ...current, name }))
            }
          />
        )}
        {activeTab === "Agenda" && <AgendaScreen context={context} />}
        {activeTab === "Recompensas" && <RewardsScreen context={context} />}
      </main>

      {visualNotice && (
        <div className="rv-notice" role="status" aria-live="polite">
          <span className="rv-notice-icon" aria-hidden="true"><Check size={18} strokeWidth={2.5} /></span>
          <p>{visualNotice}</p>
          <button type="button" onClick={() => setVisualNotice(null)}>Fechar</button>
        </div>
      )}

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
              {!confirmation.single && (
                <button
                  className="ghost"
                  onClick={() => setConfirmation(null)}
                >
                  Voltar
                </button>
              )}

              <button
                className={confirmation.danger ? "primary-submit danger" : "primary-submit"}
                onClick={handleConfirmationAction}
              >
                {confirmation.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}