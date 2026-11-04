import { Coins } from "lucide-react";

export default function RewardsScreen({ context }) {
  const { points, rewardsLoaded, isSupabaseEnabled, rewards, handleRedeem } = context;

  const nextReward = rewards
    .filter((reward) => !reward.redeemed && reward.cost > points)
    .sort((a, b) => a.cost - b.cost)[0];

  return (
    <>
      <section className="balance-card" aria-live="polite">
        <Coins className="balance-icon" aria-hidden="true" />
        <div>
          <small>Seu saldo</small>
          <strong>
            {points} <span>fichas vitais</span>
          </strong>
          {nextReward && (
            <p>
              Faltam {nextReward.cost - points} fichas pra trocar por: {nextReward.title}.
            </p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Trocar fichas</h3>
        </div>

        {!rewardsLoaded && isSupabaseEnabled && (
          <p className="empty-state">Carregando seu saldo…</p>
        )}

        <ul className="row-list">
          {rewards.map(({ id, icon: RewardIcon, title, detail, cost, redeemed }) => {
            const missing = cost - points;
            const disabled = redeemed || missing > 0;

            return (
              <li className="row-item reward-row" key={id}>
                <RewardIcon className="row-icon" aria-hidden="true" />
                <div className="row-main">
                  <strong>{title}</strong>
                  <p>
                    {detail} · {cost} fichas
                  </p>
                </div>
                <button
                  type="button"
                  className={disabled ? "small-button locked" : "small-button success"}
                  onClick={() => handleRedeem(id)}
                  disabled={disabled}
                >
                  {redeemed ? "Resgatado" : missing > 0 ? `Faltam ${missing}` : "Trocar"}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="form-note">
          As recompensas ainda são demonstrativas: não há parceria ativa com VEM, cinemas ou Compaz.
        </p>
      </section>
    </>
  );
}
