import { useMemo, useState } from 'react';
import './styles.css';

const MAX_APPOINTMENTS = 4;

const initialAgenda = [];

const initialRewards = [
  { id: 1, icon: '🚌', title: 'Crédito no VEM', cost: 200, redeemed: false },
  { id: 2, icon: '🎭', title: 'Ingresso Cinema/Teatro', cost: 150, redeemed: false },
  { id: 3, icon: '📚', title: 'Vaga Curso COMPAZ', cost: 300, redeemed: false },
];

const tabs = ['Início', 'Agenda', 'Recompensas'];

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
  const [form, setForm] = useState({
    type: 'Consulta',
    date: '',
    time: '',
    location: '',
  });

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

  const handleLocationSearch = async () => {
    const query = form.location.trim();
    if (!query) {
      setLocationError('Digite o endereço da consulta para buscar.');
      setLocationResults([]);
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('limit', '5');
      url.searchParams.set('countrycodes', 'br');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('q', query);

      const response = await fetch(url.toString(), {
        headers: {
          'Accept-Language': 'pt-BR',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar local');
      }

      const data = await response.json();
      const filtered = data.filter((place) => (place.address?.country_code || '').toLowerCase() === 'br');
      setLocationResults(filtered);

      if (!filtered.length) {
        setLocationError('Nenhum endereço no Brasil foi encontrado para essa consulta.');
      }
    } catch (error) {
      setLocationError('Não foi possível localizar o endereço da consulta no momento.');
      setLocationResults([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleScheduleSubmit = (event) => {
    event.preventDefault();

    if (!form.date || !form.time || !form.location.trim()) {
      openConfirmation('validation', {
        title: 'Preencha os dados da consulta',
        message: 'Informe a data, o horário e o local antes de confirmar o agendamento.',
      });
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

  const handleConfirmationAction = () => {
    if (!confirmation) return;

    if (confirmation.type === 'validation') {
      setConfirmation(null);
      return;
    }

    if (confirmation.type === 'presence') {
      const selected = agenda.find((item) => item.id === confirmation.id);
      if (selected && !selected.confirmed) {
        setAgenda((current) =>
          current.map((item) =>
            item.id === confirmation.id ? { ...item, confirmed: true } : item
          )
        );
        setPoints((current) => current + selected.points);
      }
    }

    if (confirmation.type === 'delete') {
      setAgenda((current) => current.filter((item) => item.id !== confirmation.id));
    }

    if (confirmation.type === 'schedule') {
      const nextItem = {
        id: Date.now(),
        ...confirmation.payload,
        confirmed: false,
      };

      setAgenda((current) => [nextItem, ...current]);
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

  const handleAuthSubmit = (event) => {
    event.preventDefault();

    if (authMode === 'signup') {
      if (!authForm.name.trim() || !authForm.email.trim() || !authForm.password || !authForm.confirmPassword) {
        return;
      }

      if (authForm.password !== authForm.confirmPassword) {
        return;
      }

      setIsLoggedIn(true);
      setAuthForm((current) => ({ ...current, password: '', confirmPassword: '' }));
      return;
    }

    if (!authForm.email.trim() || !authForm.password) {
      return;
    }

    const hasAccount = authForm.email.trim().toLowerCase() === 'usuario@recifevital.com' && authForm.password === '123456';
    if (!hasAccount) {
      setAuthMode('signup');
      setAuthForm((current) => ({ ...current, password: '', confirmPassword: '' }));
      return;
    }

    setIsLoggedIn(true);
    setAuthForm((current) => ({ ...current, password: '', confirmPassword: '' }));
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
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            />
          </label>

          <label>
            Horário
            <input
              type="time"
              value={form.time}
              onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
            />
          </label>

          <label>
            Local
            <input
              type="text"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Digite o endereço da consulta"
            />
          </label>
        </div>

        <div className="location-controls">
          <button type="button" className="secondary location-search" onClick={handleLocationSearch} disabled={locationLoading}>
            {locationLoading ? 'Buscando...' : 'Buscar endereço'}
          </button>
        </div>

        {locationError && <p className="location-error">{locationError}</p>}

        {locationResults.length > 0 && (
          <div className="location-results">
            {locationResults.map((place) => (
              <button
                type="button"
                key={place.place_id || `${place.lat}-${place.lon}`}
                className="location-result"
                onClick={() => {
                  const shortLabel = place.address?.road || place.address?.suburb || place.address?.city || place.display_name.split(',')[0];
                  setForm((current) => ({ ...current, location: shortLabel }));
                  setLocationResults([]);
                  setLocationError('');
                }}
              >
                <strong>{place.address?.road || place.address?.suburb || place.display_name.split(',')[0]}</strong>
                <span>{place.display_name}</span>
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
