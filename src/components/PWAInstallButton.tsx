import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'outline' | 'subtle';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'primary',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // Déjà installé
  if (isInstalled || justInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        PWA Installée
      </span>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
    }
  };

  const baseStyle =
    variant === 'primary'
      ? 'bg-amber-700 hover:bg-amber-800 text-white shadow-sm hover:shadow'
      : variant === 'outline'
      ? 'border border-amber-700/50 text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30'
      : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-950/40';

  // Navigateur Chrome / Android / Edge / Desktop prenant en charge beforeinstallprompt
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        aria-label="Installer la landing page comme application PWA"
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${baseStyle} ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Installer la PWA</span>
      </button>
    );
  }

  // Navigateur iOS Safari
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Instructions d'installation sur iPhone / iPad"
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-stone-500" />
          <span>Installer sur iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-3">
                <Smartphone className="w-5 h-5" />
              </div>

              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                Installer OCRBookor sur iPhone / iPad
              </h3>
              <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Safari sur iOS ne prend pas en charge l'installation automatique. Suivez ces 2 étapes simples :
              </p>

              <ol className="mt-3 space-y-2 text-xs text-stone-700 dark:text-stone-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-700 dark:text-amber-400">1.</span>
                  <span>Touchez le bouton de partage <Share className="w-3.5 h-3.5 inline mx-0.5 text-stone-500" /> dans la barre de Safari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-700 dark:text-amber-400">2.</span>
                  <span>Faites défiler puis sélectionnez <strong>« Sur l'écran d'accueil »</strong>.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 py-2 text-xs font-semibold hover:opacity-90 transition"
              >
                J'ai compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback si pas de prompt disponible (desktop Firefox ou standalone sans event)
  return (
    <button
      onClick={() => {
        alert("Pour installer cette PWA, utilisez l'icône d'installation dans la barre d'adresse de votre navigateur (Chrome/Edge) ou le menu « Ajouter à l'écran d'accueil ».");
      }}
      aria-label="Information sur l'installation PWA"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition ${className}`}
    >
      <Download className="w-3.5 h-3.5 text-stone-400" />
      <span>PWA</span>
    </button>
  );
};
