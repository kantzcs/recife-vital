import { useEffect, useState } from "react";
import { RefreshCw, Share, Smartphone, WifiOff, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";

const DISMISS_KEY = "rv-install-dismissed-at";
const DISMISS_DAYS = 14;

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  const ua = window.navigator.userAgent;
  // iPadOS se apresenta como Mac, mas tem tela de toque.
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

// Avisos do app: instalar, sem conexão e nova versão disponível.
export default function PwaStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [installEvent, setInstallEvent] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);
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

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return undefined;

    // Android e computador (Chrome, Edge): o navegador avisa que dá pra instalar.
    const onPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      setShowInstall(true);
    };
    const onInstalled = () => {
      setShowInstall(false);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iPhone e iPad não têm esse aviso; mostramos o passo a passo.
    let timer;
    if (isIos()) {
      timer = setTimeout(() => {
        setIosHelp(true);
        setShowInstall(true);
      }, 1500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(timer);
    };
  }, []);

  const dismissInstall = () => {
    setShowInstall(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Sem armazenamento: o aviso só volta na próxima visita.
    }
  };

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "accepted") setShowInstall(false);
    else dismissInstall();
  };

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

      {showInstall && !needRefresh && (
        <aside className="pwa-install" aria-labelledby="pwa-install-title">
          <button type="button" className="pwa-install-close" onClick={dismissInstall} aria-label="Fechar aviso">
            <X size={18} strokeWidth={2.25} />
          </button>
          <img src="/pwa-192.png" alt="" className="pwa-install-icon" width="48" height="48" />
          <div className="pwa-install-text">
            <h2 id="pwa-install-title">O Recife Vital funciona melhor como app</h2>
            {iosHelp ? (
              <p>
                Toque em <Share size={14} strokeWidth={2.25} aria-label="Compartilhar" className="pwa-inline-icon" />{" "}
                <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.
              </p>
            ) : (
              <p>Abre direto da tela inicial, em tela cheia e mais rápido.</p>
            )}
          </div>
          {!iosHelp && (
            <div className="pwa-install-actions">
              <button type="button" className="pwa-install-later" onClick={dismissInstall}>Agora não</button>
              <button type="button" className="pwa-install-cta" onClick={install}>
                <Smartphone size={16} strokeWidth={2.25} aria-hidden="true" />
                Instalar app
              </button>
            </div>
          )}
        </aside>
      )}
    </>
  );
}
