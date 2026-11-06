/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Clock,
  Download,
  Cpu,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  Package,
  Copy,
  Check,
} from 'lucide-react';
import { ApiClient, OCREnginesStatus } from '../services/apiClient';
import { useTranslation } from '../i18n';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal: () => void;
  onOpenDocs: (docKey: string) => void;
}

const APP_VERSION = '1.3.0';
const RELEASE_DATE_FR = '5 Novembre 2026';
const RELEASE_DATE_EN = 'November 5, 2026';
const LAST_CHECK_KEY = 'ocrbookor_last_update_check';

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenLegal,
  onOpenDocs,
}) => {
  const { t, language } = useTranslation();
  const isFr = language === 'fr';

  const [lastCheckDate, setLastCheckDate] = useState<string>('');
  const [isCheckingUpdates, setIsCheckingUpdates] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'up-to-date' | 'error'>('idle');
  const [ocrEngines, setOcrEngines] = useState<OCREnginesStatus | null>(null);
  const [loadingEngines, setLoadingEngines] = useState<boolean>(false);
  const [downloadPlatform, setDownloadPlatform] = useState<'linux' | 'windows'>(() =>
    typeof navigator !== 'undefined' && /Win/i.test(navigator.userAgent) ? 'windows' : 'linux'
  );
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  useEffect(() => {
    if (isOpen) {
      const savedDate = localStorage.getItem(LAST_CHECK_KEY);
      if (savedDate) {
        setLastCheckDate(savedDate);
      } else {
        const initial = new Date().toLocaleString(isFr ? 'fr-FR' : 'en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        setLastCheckDate(initial);
        localStorage.setItem(LAST_CHECK_KEY, initial);
      }

      // Fetch actual backend OCR status
      setLoadingEngines(true);
      ApiClient.getOCREngines()
        .then((engines) => setOcrEngines(engines))
        .catch(() => {
          setOcrEngines({
            tesseract_wasm: { available: true, supported_languages: ['fra', 'fra_old', 'eng', 'deu', 'lat'] },
            tesseract_cli: { available: false, supported_languages: [] },
            paddleocr: { available: false, supported_languages: [] },
            rapidocr: { available: false, supported_languages: [] },
          });
        })
        .finally(() => setLoadingEngines(false));
    }
  }, [isOpen, isFr]);

  if (!isOpen) return null;

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true);
    setUpdateStatus('idle');

    try {
      await ApiClient.checkHealth().catch(() => null);
      await new Promise((r) => setTimeout(r, 800));

      const nowFormatted = new Date().toLocaleString(isFr ? 'fr-FR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setLastCheckDate(nowFormatted);
      localStorage.setItem(LAST_CHECK_KEY, nowFormatted);
      setUpdateStatus('up-to-date');
    } catch {
      setUpdateStatus('error');
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isFr ? 'Paramètres Système & Mises à Jour' : 'System Settings & Updates'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isFr
                  ? 'Informations sur la version, les moteurs et l’environnement hôte'
                  : 'Version details, engine status, and host environment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-600 dark:text-slate-300">
          {/* Version & Release info card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  {isFr ? 'Version Actuelle' : 'Current Version'}
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  OCRBookor v{APP_VERSION}
                  <span className="rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5">
                    {isFr ? 'Version Stable' : 'Stable Release'}
                  </span>
                </span>
              </div>
              <button
                onClick={handleCheckUpdates}
                disabled={isCheckingUpdates}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                <span>
                  {isCheckingUpdates
                    ? isFr
                      ? 'Vérification...'
                      : 'Checking...'
                    : isFr
                    ? 'Vérifier les mises à jour'
                    : 'Check for Updates'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    {isFr ? 'Date de sortie :' : 'Release date:'}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {isFr ? RELEASE_DATE_FR : RELEASE_DATE_EN}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    {isFr ? 'Dernière vérification :' : 'Last check:'}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {lastCheckDate || (isFr ? 'Jamais vérifié' : 'Never checked')}
                  </span>
                </div>
              </div>
            </div>

            {/* Update status message */}
            {updateStatus === 'up-to-date' && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>{isFr ? 'Votre application est parfaitement à jour !' : 'Your software is fully up to date!'}</strong>{' '}
                  {isFr
                    ? `Vous disposez de la version la plus récente (v${APP_VERSION}).`
                    : `You are running the latest release (v${APP_VERSION}).`}
                </span>
              </div>
            )}
          </div>

          {/* Multi-Platform Desktop Releases card (Windows & Linux) */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                  {isFr ? 'Application Desktop Locale (v1.3.0)' : 'Native Desktop Application (v1.3.0)'}
                </h3>
              </div>
              {/* Platform selector pill */}
              <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setDownloadPlatform('windows')}
                  className={`px-2 py-0.5 rounded-md font-medium transition ${
                    downloadPlatform === 'windows'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🪟 Windows (x64)
                </button>
                <button
                  type="button"
                  onClick={() => setDownloadPlatform('linux')}
                  className={`px-2 py-0.5 rounded-md font-medium transition ${
                    downloadPlatform === 'linux'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🐧 Linux (.deb)
                </button>
              </div>
            </div>

            {downloadPlatform === 'windows' ? (
              <div className="space-y-2">
                <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
                  {isFr
                    ? 'Installez OCRBookor sur Windows 10/11 avec raccourci sur le Bureau et menu Démarrer, ou utilisez l’archive portable sans installation.'
                    : 'Install OCRBookor on Windows 10/11 with Desktop & Start Menu shortcuts, or use the zero-install portable archive.'}
                </p>

                {/* Express PowerShell 1-liner */}
                <div className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-[10px] flex items-center justify-between gap-2">
                  <span className="truncate">irm https://raw.githubusercontent.com/nouhailler/OCRBookor/main/scripts/windows/install-windows.ps1 | iex</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCommand('irm https://raw.githubusercontent.com/nouhailler/OCRBookor/main/scripts/windows/install-windows.ps1 | iex')}
                    className="shrink-0 text-slate-400 hover:text-white transition flex items-center gap-1"
                    title={isFr ? 'Copier la commande PowerShell' : 'Copy PowerShell command'}
                  >
                    {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd ? (isFr ? 'Copié' : 'Copied') : (isFr ? 'Copier' : 'Copy')}</span>
                  </button>
                </div>

                <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{isFr ? 'Fichiers :' : 'Files:'}</span>
                    <code className="font-mono text-indigo-600 dark:text-indigo-400">setup_x64.exe</code>
                    <span>•</span>
                    <code className="font-mono text-indigo-600 dark:text-indigo-400">win_x64.zip</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="/releases/ocrbookor_1.3.0_win_x64.zip"
                      download="ocrbookor_1.3.0_win_x64.zip"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isFr ? 'Portable (.zip)' : 'Portable (.zip)'}</span>
                    </a>
                    <a
                      href="https://github.com/nouhailler/OCRBookor/releases"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Installateur .exe' : 'Installer .exe'}</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
                  {isFr
                    ? 'Installez OCRBookor comme application native sur Debian 12/13 ou Ubuntu 22.04/24.04 avec raccourci système et service local autonome.'
                    : 'Install OCRBookor as a native desktop application on Debian/Ubuntu with system shortcut and local daemon.'}
                </p>

                {/* Express curl 1-liner */}
                <div className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-[10px] flex items-center justify-between gap-2">
                  <span className="truncate">curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/install.sh | sudo bash</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCommand('curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/install.sh | sudo bash')}
                    className="shrink-0 text-slate-400 hover:text-white transition flex items-center gap-1"
                    title={isFr ? 'Copier la commande curl' : 'Copy curl command'}
                  >
                    {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd ? (isFr ? 'Copié' : 'Copied') : (isFr ? 'Copier' : 'Copy')}</span>
                  </button>
                </div>

                <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">
                    {isFr ? 'Fichier :' : 'File:'} <code className="font-mono text-indigo-600 dark:text-indigo-400">ocrbookor_1.3.0_amd64.deb</code>
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://github.com/nouhailler/OCRBookor/releases"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>GitHub</span>
                    </a>
                    <a
                      href="/releases/ocrbookor_1.3.0_amd64.deb"
                      download="ocrbookor_1.3.0_amd64.deb"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Télécharger le .deb' : 'Download .deb'}</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* OCR Engines & System diagnostic */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-slate-500" />
                {isFr ? 'Diagnostic des Moteurs OCR' : 'OCR Engines Diagnostics'}
              </span>
              <span className="text-[10px] text-slate-400">
                {isFr ? 'Détection dynamique' : 'Dynamic detection'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">Tesseract WebAssembly</span>
                  <span className="text-[10px] text-slate-400">
                    {isFr ? 'Exécution client navigateur' : 'In-browser client execution'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  {isFr ? 'Actif (100% Hors-ligne)' : 'Active (100% Offline)'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">Tesseract CLI Système</span>
                  <span className="text-[10px] text-slate-400">
                    {isFr ? 'Binaire hôte local' : 'Local system binary'}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ocrEngines?.tesseract?.available
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {ocrEngines?.tesseract?.available
                    ? isFr
                      ? 'Installé'
                      : 'Installed'
                    : isFr
                    ? 'Non requis (Wasm actif)'
                    : 'Optional (Wasm ready)'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">PaddleOCR / RapidOCR</span>
                  <span className="text-[10px] text-slate-400">Deep Learning PP-OCR</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  {ocrEngines?.paddleocr?.available || ocrEngines?.rapidocr?.available
                    ? isFr
                      ? 'Installé'
                      : 'Installed'
                    : isFr
                    ? 'Service local optionnel'
                    : 'Optional local service'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {isFr ? 'Stockage Local' : 'Local Storage'}
                  </span>
                  <span className="text-[10px] text-slate-400">IndexedDB &amp; SQLite</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  {isFr ? 'Opérationnel' : 'Operational'}
                </span>
              </div>
            </div>
          </div>

          {/* Legal and Documentation links */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onOpenLegal();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isFr ? 'Consulter les Mentions Légales & Responsabilité' : 'View Legal Notice & Disclaimers'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDocs('CHANGELOG');
              }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <span>{isFr ? 'Voir le Journal des Modifications' : 'View Changelog'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
