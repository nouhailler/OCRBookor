/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  BookOpen,
  CheckCircle2,
  Lock,
  Cpu,
  FileCheck,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Logo } from './Logo';

interface OnboardingModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void;
  forceReview?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onAccept,
  onClose,
  forceReview = false,
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(forceReview);
  const [activeTab, setActiveTab] = useState<'presentation' | 'mentions'>('presentation');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (acceptedTerms) {
      localStorage.setItem('ocrbookor_legal_accepted_v1', 'true');
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Logo */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 flex items-center justify-between">
          <Logo size="md" showText={true} version="v1.2" />
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('presentation')}
              className={`px-3 py-1 font-semibold rounded-md transition ${
                activeTab === 'presentation'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Présentation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mentions')}
              className={`px-3 py-1 font-semibold rounded-md transition flex items-center gap-1 ${
                activeTab === 'mentions'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              Mentions Légales & Responsabilité
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-slate-700 dark:text-slate-300">
          {activeTab === 'presentation' ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl p-4 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Bienvenue dans OCRBookor
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      L’outil local de référence pour transformer les livres scannés (PDF) en e-books professionnels conformes au standard <strong>EPUB 3</strong>, <strong>Markdown</strong> et <strong>TXT</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Workflow cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span>100% Hors-Ligne & Confidentiel</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Vos documents, images et livres ne quittent jamais votre ordinateur. Aucun serveur externe ni télémétrie.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <Cpu className="w-4 h-4 text-indigo-500" />
                    <span>Moteur OCR WebAssembly</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Reconnaissance optique haute précision Tesseract v5 intégrée, modèles de langue français et français ancien.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>Typographie de l’Imprimerie Nationale</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Gestion automatique des espaces insécables, guillemets français « », tirets de dialogue et ligatures œ/æ.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <FileCheck className="w-4 h-4 text-blue-500" />
                    <span>Export EPUB 3 Strict IDPF</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Archives validées pour Apple Books, Kobo, Kindle et Calibre avec table des matières et styles calibrés.
                  </p>
                </div>
              </div>

              {/* Warning box */}
              <div className="rounded-xl p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 dark:text-amber-300 font-semibold block">
                    Important : Responsabilité relative aux documents importés
                  </strong>
                  <span className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                    Avant de commencer, vous devez prendre connaissance de la clause de non-responsabilité juridique concernant les fichiers et données que vous introduisez dans l’application.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <div className="rounded-xl p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-300 text-sm">
                  <Scale className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span>DÉCHARGE EXPRESSE DE RESPONSABILITÉ SUR LES DONNÉES FOURNIES</span>
                </div>
                <p className="text-rose-800 dark:text-rose-200/90 leading-relaxed">
                  L’auteur, le mainteneur et les contributeurs du logiciel <strong>OCRBookor</strong> déclinent expressément toute responsabilité, directe ou indirecte, quant à la nature, l’origine, l’exactitude, la licéité, la confidentialité ou les droits de propriété intellectuelle liés aux données, images, fichiers PDF et textes importés, traités ou exportés dans cette application.
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    1. Propriété intellectuelle et Droits d’Auteur
                  </h4>
                  <p>
                    L’utilisateur est <strong>seul et entièrement responsable</strong> de s’assurer qu’il détient les droits nécessaires (droits d’auteur, appartenance au domaine public, licence de reproduction ou exception légale pour copie privée) sur tout document ou livre qu’il numérise ou convertit.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    2. Protection des Données et Confidentialité
                  </h4>
                  <p>
                    L’application fonctionnant intégralement en local (sur votre machine hôte ou navigateur), aucun hébergement ni stockage centralisé n’est effectué par l’éditeur. L’utilisateur assume l’entière responsabilité de la protection des données sensibles ou personnelles pouvant figurer dans ses fichiers.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    3. Absence de Garantie de Transcription
                  </h4>
                  <p>
                    La reconnaissance optique de caractères (OCR) est fournie « en l’état » sans aucune garantie d’infaillibilité. Une relecture humaine reste nécessaire avant toute publication ou diffusion éditoriale.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mandatory Checkbox */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                <strong>Je reconnais avoir pris connaissance des mentions légales</strong> et j’accepte expressément la clause déchargeant l’auteur d’OCRBookor de toute responsabilité relative aux fichiers et données que j’introduis ou exporte dans l’application.
              </span>
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          {onClose && forceReview ? (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-2 rounded-lg"
            >
              Fermer
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              Acceptation requise pour démarrer
            </span>
          )}

          <div className="flex items-center gap-2">
            {activeTab === 'presentation' && (
              <button
                type="button"
                onClick={() => setActiveTab('mentions')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-3 py-2"
              >
                Lire les mentions légales →
              </button>
            )}

            <button
              type="button"
              disabled={!acceptedTerms}
              onClick={handleConfirm}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition ${
                acceptedTerms
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                  : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Accepter et Commencer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
