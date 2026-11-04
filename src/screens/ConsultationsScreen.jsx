import { Droplet, HeartPulse } from "lucide-react";

const STATUS_TEXT = {
  controlada: "Dentro da faixa de referência",
  atenção: "Um pouco acima da referência",
  alta: "Acima da referência. Converse com sua equipe de saúde",
};

export default function ConsultationsScreen({ context }) {
  const {
    vitals,
    handleVitalsSubmit,
    setVitals,
    vitalsError,
    lastVitals,
    pressureStatus,
    glucoseStatus,
    vitalsHistory,
  } = context;

  const update = (key) => (event) =>
    setVitals((current) => ({ ...current, [key]: event.target.value }));

  return (
    <>
      {lastVitals && (
        <section className="vitals-summary" aria-label="Última medida">
          <div className={`vitals-badge ${pressureStatus}`}>
            <HeartPulse aria-hidden="true" />
            <div>
              <small>Pressão</small>
              <strong>
                {lastVitals.systolic}/{lastVitals.diastolic}
                <span className="unit"> mmHg</span>
              </strong>
              <p>{STATUS_TEXT[pressureStatus]}</p>
            </div>
          </div>

          {lastVitals.glucose && (
            <div className={`vitals-badge ${glucoseStatus}`}>
              <Droplet aria-hidden="true" />
              <div>
                <small>Glicemia</small>
                <strong>
                  {lastVitals.glucose}
                  <span className="unit"> mg/dL</span>
                </strong>
                <p>{STATUS_TEXT[glucoseStatus]}</p>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <h3>Registrar medida</h3>
        </div>

        <form className="vitals-form" onSubmit={handleVitalsSubmit}>
          <div className="field-grid">
            <label>
              Pressão: número de cima
              <input
                type="number"
                inputMode="numeric"
                placeholder="120"
                value={vitals.systolic}
                onChange={update("systolic")}
              />
            </label>

            <label>
              Pressão: número de baixo
              <input
                type="number"
                inputMode="numeric"
                placeholder="80"
                value={vitals.diastolic}
                onChange={update("diastolic")}
              />
            </label>

            <label>
              Glicemia em mg/dL (opcional)
              <input
                type="number"
                inputMode="numeric"
                placeholder="95"
                value={vitals.glucose}
                onChange={update("glucose")}
              />
            </label>
          </div>

          {vitalsError && <p className="location-error">{vitalsError}</p>}

          <button type="submit" className="primary-submit vitals-submit">
            Salvar medida
          </button>
          <p className="form-note">
            Por enquanto as medidas ficam só neste aparelho e somem ao sair da conta.
          </p>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Histórico</h3>
        </div>

        {vitalsHistory.length === 0 ? (
          <p className="empty-state">
            Quando você salvar uma medida, ela aparece aqui com data e horário.
          </p>
        ) : (
          <ul className="row-list">
            {vitalsHistory.map((entry) => (
              <li className="row-item" key={entry.id}>
                <div className="row-main">
                  <strong>
                    {entry.systolic}/{entry.diastolic} mmHg
                    {entry.glucose ? ` · ${entry.glucose} mg/dL` : ""}
                  </strong>
                </div>
                <span className="row-meta">{entry.recordedAt}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
