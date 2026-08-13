import { useEffect, useMemo, useState } from 'react';
import { supabase, hasSupabaseConfig } from './lib/supabase';
import './styles.css';

const MAX_APPOINTMENTS = 4;

const initialAgenda = [];

const initialRewards = [
  { id: 1, icon: '🚌', title: 'Crédito no VEM', cost: 200, redeemed: false },
  { id: 2, icon: '🎭', title: 'Ingresso Cinema/Teatro', cost: 150, redeemed: false },
  { id: 3, icon: '📚', title: 'Vaga Curso COMPAZ', cost: 300, redeemed: false },
];

const RECIFE_HEALTH_LOCATIONS = [
  { id: 1, name: 'IMIP', category: 'Hospital', area: 'Boa Vista, Recife - PE' },
  { id: 2, name: 'Hospital Geral do Recife', category: 'Hospital', area: 'Boa Vista, Recife - PE' },
  { id: 3, name: 'Hospital da Restauração', category: 'Hospital', area: 'Santo Amaro, Recife - PE' },
  { id: 4, name: 'Unidade de Saúde da Várzea', category: 'Posto de Saúde', area: 'Várzea, Recife - PE' },
  { id: 5, name: 'Posto de Saúde da Boa Viagem', category: 'Posto de Saúde', area: 'Boa Viagem, Recife - PE' },
  { id: 6, name: 'Unidade de Saúde do Ibura', category: 'Posto de Saúde', area: 'Ibura, Recife - PE' },
  { id: 7, name: 'Policlínica Dantas Barreto', category: 'Policlínica', area: 'Graças, Recife - PE' },
  { id: 8, name: 'Unidade de Saúde do Pina', category: 'Posto de Saúde', area: 'Pina, Recife - PE' },
];

const normalizeLocationText = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const tabs = ['Início', 'Agenda', 'Recompensas'];

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
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [activeTab, setActiveTab] = useState('Início');
  const [showDetails, setShowDetails] = useState(false);
  const [points, setPoints] = useState(0);
  const [agenda, setAgenda] = useState(initialAgenda);
  const [rewards, setRewards] = useState(initialRewards);
  const [selectedCard, setSelectedCard] = useState('agenda');
  const [confirmation, setConfirmation] = useState(null);
  const [locationResults, setLocationResults] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [appointmentError, setAppointmentError] = useState('');
  const [profileId, setProfileId] = useState(null);
  const [form, setForm] = useState({
    type: 'Consulta',
    date: '',
    time: '',
    location: '',
  });

  const isSupabaseEnabled = hasSupabaseConfig && Boolean(supabase);

  // Verificar sessão existente ao montar o app
  // Carregar pontos do localStorage ao montar (apenas uma vez)
  useEffect(() => {
    const savedPoints = localStorage.getItem('recife_vital_points');
    if (savedPoints !== null) {
      const parsedPoints = parseInt(savedPoints, 10);
      if (!isNaN(parsedPoints) && parsedPoints >= 0) {
        setPoints(parsedPoints);
      }
    }
  }, []);

  // Salvar pontos no localStorage sempre que mudam
  useEffect(() => {
    localStorage.setItem('recife_vital_points', points.toString());
  }, [points]);

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseEnabled || !supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setProfileId(session.user.id);
        await ensureSupabaseProfile(
          session.user.id,
          session.user.user_metadata?.name,
          session.user.email
        );
        setAuthForm((current) => ({
          ...current,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || ''
        }));
        setIsLoggedIn(true);
      }
    };

    checkSession();
  }, [isSupabaseEnabled]);

  const pendingItems = useMemo(
    () => agenda.filter((item) => !item.confirmed),
    [agenda]
  );

  const activeAppointments = agenda.length;
  const limitReached = activeAppointments >= MAX_APPOINTMENTS;
  const nextLevelProgress = useMemo(() => Math.min((points / 500) * 100, 100), [points]);

  const openConfirmation = (type, payload) => {
    setConfirmation({ type, ...payload });
  };

  const syncAgendaFromSupabase = async (userId) => {
    if (!isSupabaseEnabled || !userId) return;

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return;
    }

    setAgenda((data ?? []).map(mapSupabaseAppointment));
  };

  const ensureSupabaseProfile = async (userId, userName, userEmail) => {
    if (!isSupabaseEnabled || !userId) return;

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
      const { error } = await supabase.from('profiles').insert({
        id: userId,
        name: userName || userEmail?.split('@')[0] || 'Usuário',
        email: userEmail,
      });

      if (error) {
        return;
      }
    }

    setProfileId(userId);
    await syncAgendaFromSupabase(userId);
  };

  const handleConfirmPresence = (id) => {
    const selected = agenda.find((item) => item.id === id);
    if (!selected || selected.confirmed) return;

    openConfirmation('presence', {
      id,
      title: 'Confirmar presença',
      message: `Deseja confirmar a presença em ${selected.type} de ${selected.date}?`,
    });
  };

  const handleDeleteAppointment = (id) => {
    const selected = agenda.find((item) => item.id === id);
    if (!selected) return;

    openConfirmation('delete', {
      id,
      title: 'Excluir agendamento',
      message: `Essa ação remove ${selected.type} de ${selected.date} e não pode ser desfeita.`,
    });
  };

  const handleRedeem = (rewardId) => {
    const selected = rewards.find((item) => item.id === rewardId);
    if (!selected || selected.redeemed || points < selected.cost) return;

    setRewards((current) =>
      current.map((item) =>
        item.id === rewardId ? { ...item, redeemed: true } : item
      )
    );
    setPoints((current) => current - selected.cost);
  };

  const handleLocationSearch = () => {
    const query = form.location.trim();

    if (!query) {
      setLocationResults(RECIFE_HEALTH_LOCATIONS);
      setLocationError('');
      return;
    }

    const normalizedQuery = normalizeLocationText(query);
    const filtered = RECIFE_HEALTH_LOCATIONS.filter((place) =>
      normalizeLocationText(`${place.name} ${place.category} ${place.area}`).includes(normalizedQuery)
    );

    setLocationResults(filtered);

    if (!filtered.length) {
      setLocationError('Nenhuma unidade de saúde em Recife com atendimento de consultas foi encontrada. Tente procurar por IMIP, Hospital Geral, Boa Viagem ou outra unidade da cidade.');
      return;
    }

    setLocationError('');
  };

  const isDateTimeValid = (date, time) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    return appointmentDateTime > now;
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleTimeChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    
    if (value.length <= 2) {
      value = value;
    } else if (value.length <= 4) {
      value = value.slice(0, 2) + ':' + value.slice(2);
    } else {
      value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }

    setForm((current) => ({ ...current, time: value }));
  };

  const handleTimeBlur = () => {
    if (form.time && form.time.length === 5) {
      const [hours, minutes] = form.time.split(':');
      const h = parseInt(hours, 10);
      const m = parseInt(minutes, 10);
      
      if (h < 0 || h > 23 || m < 0 || m > 59) {
        setAppointmentError('Hora inválida. Use o formato HH:MM (00:00 a 23:59)');
        return;
      }
    }
    setAppointmentError('');
  };

  const handleScheduleSubmit = (event) => {
    event.preventDefault();

    setAppointmentError('');

    if (!form.date || !form.time || !form.location.trim()) {
      openConfirmation('validation', {
        title: 'Preencha os dados da consulta',
        message: 'Informe a data, o horário e o local antes de confirmar o agendamento.',
      });
      return;
    }

    if (!isDateTimeValid(form.date, form.time)) {
      setAppointmentError('A data e hora devem ser no futuro. Selecione uma data e hora posteriores ao momento atual.');
      return;
    }

    if (activeAppointments >= MAX_APPOINTMENTS) {
      openConfirmation('limit', {
        title: 'Limite de consultas atingido',
        message: `Você já possui ${activeAppointments} consultas agendadas. Exclua uma antes de criar outra.`,
      });
      return;
    }

    openConfirmation('schedule', {
      title: 'Confirmar agendamento',
      message: `Deseja criar ${form.type} para ${formatDate(form.date)} às ${form.time}?`,
      payload: {
        type: form.type,
        date: formatDate(form.date),
        time: form.time,
        location: form.location,
        points: form.type === 'Consulta' ? 50 : form.type === 'Retirada' ? 30 : 40,
      },
    });
  };

  const handleConfirmationAction = async () => {
    if (!confirmation) return;

    if (confirmation.type === 'validation') {
      setConfirmation(null);
      return;
    }

    if (confirmation.type === 'presence') {
      const selected = agenda.find((item) => item.id === confirmation.id);
      if (selected && !selected.confirmed) {
        if (isSupabaseEnabled && profileId && supabase) {
          const { error } = await supabase
            .from('appointments')
            .update({ confirmed: true })
            .eq('id', confirmation.id);

          if (error) {
            setAppointmentError('Não foi possível confirmar a presença no banco de dados.');
            setConfirmation(null);
            return;
          }

          await syncAgendaFromSupabase(profileId);
        }

        setAgenda((current) =>
          current.map((item) =>
            item.id === confirmation.id ? { ...item, confirmed: true } : item
          )
        );
        setPoints((current) => current + selected.points);
      }
    }

    if (confirmation.type === 'delete') {
      if (isSupabaseEnabled && profileId && supabase) {
        const { error } = await supabase.from('appointments').delete().eq('id', confirmation.id);
        if (error) {
          setAppointmentError('Não foi possível excluir o agendamento no banco de dados.');
          setConfirmation(null);
          return;
        }

        await syncAgendaFromSupabase(profileId);
      }

      setAgenda((current) => current.filter((item) => item.id !== confirmation.id));
    }

    if (confirmation.type === 'schedule') {
      const nextItem = {
        id: Date.now(),
        ...confirmation.payload,
        confirmed: false,
      };

      if (isSupabaseEnabled && profileId && supabase) {
        const { data, error } = await supabase
          .from('appointments')
          .insert({
            user_id: profileId,
            type: confirmation.payload.type,
            date: confirmation.payload.date,
            time: confirmation.payload.time,
            location: confirmation.payload.location,
            points: confirmation.payload.points,
            confirmed: false,
          })
          .select();

        if (error) {
          setAppointmentError('Não foi possível salvar o agendamento no banco. Verifique os dados e tente novamente.');
          setConfirmation(null);
          return;
        }

        if (data?.[0]) {
          setAgenda((current) => [mapSupabaseAppointment(data[0]), ...current]);
        } else {
          setAgenda((current) => [nextItem, ...current]);
        }
      } else {
        setAgenda((current) => [nextItem, ...current]);
      }

      setActiveTab('Agenda');
      setSelectedCard('agenda');
      setForm({
        type: 'Consulta',
        date: '',
        time: '',
        location: '',
      });
    }

    setConfirmation(null);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    if (isSupabaseEnabled && supabase) {
      try {
        if (authMode === 'signup') {
          if (!authForm.name.trim() || !authForm.email.trim() || !authForm.password || !authForm.confirmPassword) {
            setAuthError('Preencha todos os campos para criar a conta.');
            return;
          }

          if (authForm.password !== authForm.confirmPassword) {
            setAuthError('As senhas não conferem.');
            return;
          }

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

          const user = data?.user;
          if (user) {
            await ensureSupabaseProfile(user.id, user.user_metadata?.name || authForm.name, user.email);
          }

          setAuthError('');
          setIsLoggedIn(true);
          setAuthForm((current) => ({ ...current, password: '', confirmPassword: '' }));
          return;
        }

        if (!authForm.email.trim() || !authForm.password) {
          setAuthError('Informe e-mail e senha para entrar.');
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: authForm.email.trim(),
          password: authForm.password,
        });

        if (error) {
          setAuthError(error.message || 'Não foi possível fazer login. Verifique as credenciais.');
          setAuthMode('signup');
          return;
        }

        const user = data?.user;
        if (user) {
          await ensureSupabaseProfile(user.id, user.user_metadata?.name || authForm.name, user.email);
        }

        setAuthError('');
        setIsLoggedIn(true);
        setAuthForm((current) => ({ ...current, password: '', confirmPassword: '' }));
        return;
      } catch (error) {
        setAuthError('Não foi possível entrar com o banco de dados.');
        return;
      }
    }

    if (authMode === 'signup') {
      if (!authForm.name.trim() || !authForm.email.trim() || !authForm.password || !authForm.confirmPassword) {
        setAuthError('Preencha todos os campos para criar a conta.');
        return;
      }

      if (authForm.password !== authForm.confirmPassword) {
        setAuthError('As senhas não conferem.');
        return;
      }

      setAuthError('');
      setIsLoggedIn(true);
      setAuthForm((current) => ({ ...current, password: '', confirmPassword: '' }));
      return;
    }

    if (!authForm.email.trim() || !authForm.password) {
      setAuthError('Informe e-mail e senha para continuar.');
      return;
    }

    const hasAccount = authForm.email.trim().toLowerCase() === 'usuario@recifevital.com' && authForm.password === '123456';
    if (!hasAccount) {
      setAuthError('Conta não encontrada. Crie uma conta ou use o e-mail e senha corretos.');
      setAuthMode('signup');
      setAuthForm((current) => ({ ...current, password: '', confirmPassword: '' }));
      return;
    }

    setAuthError('');

    setIsLoggedIn(true);
    setAuthForm((current) => ({ ...current, password: '', confirmPassword: '' }));
  };

  const handleLogout = async () => {
    if (isSupabaseEnabled && supabase) {
      await supabase.auth.signOut();
    }

    setIsLoggedIn(false);
    setAuthMode('login');
    setProfileId(null);
    setAgenda([]);
    setPoints(0);
    setAuthForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setAuthError('');
    setAppointmentError('');
  };

  const handleQuickAction = (action) => {
    setSelectedCard(action);

    if (action === 'details') {
      setShowDetails((value) => !value);
      return;
    }

    if (action === 'agenda') {
      setActiveTab('Agenda');
      return;
    }

    if (action === 'rewards') {
      setActiveTab('Recompensas');
      return;
    }

    if (action === 'home') {
      setActiveTab('Início');
    }
  };

  const formatDate = (value) => {
    const date = new Date(`${value}T12:00:00`);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const nextAppointment = agenda[0] ?? null;
  const homeDateText = nextAppointment ? `📅 ${nextAppointment.date} - ${nextAppointment.time}` : '📅 Sem consulta agendada';
  const homeLocationText = nextAppointment ? `📍 ${nextAppointment.location}` : '📍 Defina o local da consulta';

  const renderHome = () => (
    <>
      <section className="hero-card">
        <div className="hero-header">
          <span className="tag">PRÓXIMA CONSULTA</span>
          <button className="mini-button" onClick={() => handleQuickAction('details')}>
            {showDetails ? 'Ocultar' : 'Detalhes'}
          </button>
        </div>

        <h2>{homeDateText}</h2>
        <p className="home-location">{homeLocationText}</p>

        {showDetails && (
          <div className="details-box">
            <p>{nextAppointment ? 'Atendimento agendado.' : 'Ainda não há consulta cadastrada.'}</p>
            <p>{nextAppointment ? `${nextAppointment.type} • ${nextAppointment.location}` : 'Cadastre sua próxima consulta para visualizar os detalhes.'}</p>
          </div>
        )}
      </section>

      <section className="quick-actions">
        <button
          className={selectedCard === 'agenda' ? 'quick-card active' : 'quick-card'}
          onClick={() => handleQuickAction('agenda')}
        >
          <span>📅</span>
          <strong>Agendar</strong>
        </button>

        <button
          className={selectedCard === 'rewards' ? 'quick-card active' : 'quick-card'}
          onClick={() => handleQuickAction('rewards')}
        >
          <span>🎁</span>
          <strong>Recompensas</strong>
        </button>

        <button
          className={selectedCard === 'home' ? 'quick-card active' : 'quick-card'}
          onClick={() => handleQuickAction('home')}
        >
          <span>🏠</span>
          <strong>Resumo</strong>
        </button>
      </section>

      <section className="stats-grid">
        <button className="stat-card points" onClick={() => handleQuickAction('rewards')}>
          <span>🪙</span>
          <strong>{points} pts</strong>
          <small>Saldo Recife Saudável</small>
        </button>

        <button className="stat-card blue" onClick={() => handleQuickAction('agenda')}>
          <span>❤️</span>
          <strong>{pendingItems.length}</strong>
          <small>Pendências em aberto</small>
        </button>

        <button className="stat-card green" onClick={() => handleQuickAction('agenda')}>
          <span>💊</span>
          <strong>{Math.min(activeAppointments, MAX_APPOINTMENTS)}/{MAX_APPOINTMENTS}</strong>
          <small>Consultas ativas</small>
        </button>

        <button className="stat-card red" onClick={() => handleQuickAction('agenda')}>
          <span>🧪</span>
          <strong>{pendingItems.length === 0 ? 'Tudo ok' : `${pendingItems.length} pendente${pendingItems.length > 1 ? 's' : ''}`}</strong>
          <small>Controle de atenção</small>
        </button>
      </section>
    </>
  );

  const renderAuthScreen = () => (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <p className="eyebrow">Recife Vital</p>
          <h2>{authMode === 'login' ? 'Entrar' : 'Criar conta'}</h2>
        </div>

        <form className="auth-form" onSubmit={handleAuthSubmit}>
          {authError && <p className="location-error">{authError}</p>}

          {authMode === 'signup' && (
            <label>
              Nome
              <input
                type="text"
                value={authForm.name}
                onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Seu nome"
              />
            </label>
          )}

          <label>
            E-mail
            <input
              type="email"
              value={authForm.email}
              onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="seu@email.com"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={authForm.password}
              onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="••••••••"
              required
            />
          </label>

          {authMode === 'signup' && (
            <label>
              Confirmar senha
              <input
                type="password"
                value={authForm.confirmPassword}
                onChange={(event) => setAuthForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                placeholder="Repita a senha"
                required
              />
            </label>
          )}

          <button type="submit" className="primary-submit auth-submit">
            {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <p className="auth-hint">
          {authMode === 'login'
            ? 'Não tem conta? Crie uma conta para agendar consultas e acompanhar pendências.'
            : 'Já possui conta? Faça login para continuar.'}
        </p>

        <div className="auth-switch">
          <span>
            {authMode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}
          </span>
          <button
            type="button"
            className="link-button"
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
          >
            {authMode === 'login' ? 'Cadastre-se' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAgenda = () => (
    <section className="panel panel-stack">
      <div className="panel-header">
        <h3>Sua Agenda</h3>
        <button className="mini-button" onClick={() => handleQuickAction('home')}>
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
                <p>{item.date} • {item.time}</p>
              </div>

              <div className="pending-actions">
                <button className="small-button success" onClick={() => handleConfirmPresence(item.id)}>
                  Confirmar
                </button>
                <button className="small-button danger" onClick={() => handleDeleteAppointment(item.id)}>
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
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
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
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
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
              maxLength="5"
              className="time-input"
            />
          </label>

          <label>
            Local
            <input
              type="text"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Digite o nome da unidade em Recife"
            />
          </label>
        </div>

        <div className="location-controls">
          <button type="button" className="secondary location-search" onClick={handleLocationSearch}>
            Buscar unidade
          </button>
        </div>

        {locationError && <p className="location-error">{locationError}</p>}
        {appointmentError && <p className="location-error">{appointmentError}</p>}

        {locationResults.length > 0 && (
          <div className="location-results">
            {locationResults.map((place) => (
              <button
                type="button"
                key={place.place_id || `${place.lat}-${place.lon}`}
                className="location-result"
                onClick={() => {
                  setForm((current) => ({ ...current, location: place.name }));
                  setLocationResults([]);
                  setLocationError('');
                }}
              >
                <strong>{place.name}</strong>
                <span>{place.category} • {place.area}</span>
              </button>
            ))}
          </div>
        )}

        <button type="submit" className="primary-submit" disabled={limitReached}>
          {limitReached ? 'Limite atingido' : 'Agendar'}
        </button>
      </form>

      {agenda.map((item) => (
        <div className="agenda-item" key={item.id}>
          <div className="agenda-head">
            <strong>{item.type}</strong>
            <span>+{item.points} pts</span>
          </div>
          <p>📅 {item.date} às {item.time}</p>
          <p className="agenda-location">📍 {item.location}</p>
          <div className="agenda-actions">
            <button
              className="agenda-action secondary"
              onClick={() => handleConfirmPresence(item.id)}
              disabled={item.confirmed}
            >
              {item.confirmed ? 'Confirmado' : 'Confirmar presença'}
            </button>
            <button className="agenda-action ghost danger" onClick={() => handleDeleteAppointment(item.id)}>
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
        <div className="points-box">{points}</div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${nextLevelProgress}%` }} />
      </div>
      <small>{points} / 500 para o próximo nível</small>

      {rewards.map((reward) => {
        const isDisabled = reward.redeemed || points < reward.cost;

        return (
          <div className="reward-item" key={reward.id}>
            <span>{reward.redeemed ? '✅' : reward.id === 1 ? '🚌' : reward.id === 2 ? '🎭' : '📚'}</span>
            <div className="reward-text">
              <strong>{reward.title}</strong>
              <small>{reward.cost} pts</small>
            </div>
            <button
              className={isDisabled ? 'locked' : ''}
              onClick={() => handleRedeem(reward.id)}
              disabled={isDisabled}
            >
              {reward.redeemed ? 'Resgatado' : points < reward.cost ? `Faltam ${reward.cost - points} pts` : 'Resgatar'}
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
          <h1>Olá, {authForm.name || 'usuário'}!</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <nav className="tab-nav" aria-label="Navegação principal">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === 'Início' && renderHome()}
        {activeTab === 'Agenda' && renderAgenda()}
        {activeTab === 'Recompensas' && renderRewards()}
      </main>

      {confirmation && (
        <div className="modal-backdrop" onClick={() => setConfirmation(null)}>
          <div className="confirmation-modal" onClick={(event) => event.stopPropagation()}>
            <h4>{confirmation.title}</h4>
            <p>{confirmation.message}</p>
            <div className="modal-actions">
              <button className="ghost" onClick={() => setConfirmation(null)}>
                Cancelar
              </button>
              <button className="primary-submit" onClick={handleConfirmationAction}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
