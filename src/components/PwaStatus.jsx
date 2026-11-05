import { useEffect, useState } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

// Avisos do app instalado: sem conexão e nova versão disponível.
export default function PwaStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Confere se saiu versão nova a cada hora com o app aberto.
      if (registration) setInterval(() => registration.update(), 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <>
      {!online && (
        <div className="pwa-offline" role="status" aria-live="polite">
          <WifiOff size={16} strokeWidth={2.25} aria-hidden="true" />
          <span>Você está sem conexão. Sua agenda e seus pontos voltam quando a internet voltar.</span>
        </div>
      )}

      {needRefresh && (
        <div className="rv-notice pwa-update" role="status" aria-live="polite">
          <span className="rv-notice-icon" aria-hidden="true"><RefreshCw size={16} strokeWidth={2.5} /></span>
          <p>Nova versão disponível.</p>
          <button type="button" className="pwa-update-later" onClick={() => setNeedRefresh(false)}>Depois</button>
          <button type="button" onClick={() => updateServiceWorker(true)}>Atualizar</button>
        </div>
      )}
    </>
  );
}
