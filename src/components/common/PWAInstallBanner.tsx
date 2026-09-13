import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, X, Smartphone, Info } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('warungku_pwa_dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('warungku_pwa_dismissed', 'true');
  };

  // If already installed or dismissed, do not show
  if (isInstalled || dismissed) {
    return null;
  }

  // Show if installable via Chromium/Android OR if on iOS Safari
  const shouldShow = isInstallable || isIOS;

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <div
        id="pwa-install-banner"
        className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-40 bg-stone-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-stone-800 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
          <Smartphone className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Aplikasi Android & PWA</p>
          <p className="text-xs text-stone-200 mt-0.5 leading-snug">
            Install <strong className="text-white">WARUNGKU</strong> di perangkat Anda untuk belanja sembako lebih cepat.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isInstallable ? (
            <button
              id="btn-install-pwa-banner"
              onClick={install}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
          ) : (
            <button
              id="btn-ios-guide-banner"
              onClick={() => setShowIOSGuide(true)}
              className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold rounded-lg transition whitespace-nowrap cursor-pointer"
            >
              Petunjuk
            </button>
          )}

          <button
            id="btn-dismiss-pwa-banner"
            onClick={handleDismiss}
            aria-label="Tutup"
            className="p-1 text-stone-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Modal Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-stone-900 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-stone-900">Install di iPhone / iPad</h3>
            <div className="mt-3 space-y-2.5 text-xs text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <p className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">1.</span>
                <span>Buka aplikasi ini di browser <strong>Safari</strong>.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">2.</span>
                <span>Ketuk ikon <strong>Share</strong> (kotak panah ke atas) di menu bawah Safari.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">3.</span>
                <span>Scroll ke bawah dan pilih <strong>Add to Home Screen</strong> (Tambah ke Layar Utama).</span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
