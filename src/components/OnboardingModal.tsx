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
import { useTranslation } from '../i18n';

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
  const { t, language } = useTranslation();
  const isFr = language === 'fr';

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
              {isFr ? 'Présentation' : 'Overview'}
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
              <span>{isFr ? 'Mentions Légales & Responsabilité' : 'Legal & Disclaimers'}</span>
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
                      {isFr ? 'Bienvenue dans OCRBookor' : 'Welcome to OCRBookor'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {isFr
                        ? 'L’outil local de référence pour transformer les livres scannés (PDF) en e-books professionnels conformes au standard EPUB 3, Markdown et TXT.'
                        : 'The definitive local tool to transform scanned PDF books into publication-ready digital books compliant with EPUB 3, Markdown, and TXT.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Workflow cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span>{isFr ? '100% Hors-Ligne & Confidentiel' : '100% Offline & Private'}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    {isFr
                      ? 'Vos documents, images et livres ne quittent jamais votre ordinateur. Aucun serveur externe ni télémétrie.'
                      : 'Your documents, scans, and books never leave your computer. No third-party servers or telemetry.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <Cpu className="w-4 h-4 text-indigo-500" />
                    <span>{isFr ? 'Moteur OCR Hybride Local' : 'Local Hybrid OCR Engines'}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    {isFr
                      ? 'Reconnaissance optique haute précision Tesseract v5 et RapidOCR intégrées.'
                      : 'High-precision local optical recognition with Tesseract 5 and RapidOCR.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>{isFr ? 'Typographie & Normalisation' : 'Typography & Normalization'}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    {isFr
                      ? 'Gestion automatique des espaces insécables, guillemets « », césures et ligatures œ/æ.'
                      : 'Automated dehyphenation, guillemets, punctuation spaces, and typographic ligatures.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <FileCheck className="w-4 h-4 text-blue-500" />
                    <span>{isFr ? 'Export EPUB 3 Strict IDPF' : 'Strict EPUB 3 IDPF Export'}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    {isFr
                      ? 'Archives validées pour Apple Books, Kobo, Kindle et Calibre avec table des matières et styles calibrés.'
                      : 'Standards-compliant bundles verified for Kobo, Kindle, Apple Books, and Calibre.'}
                  </p>
                </div>
              </div>

              {/* Warning box */}
              <div className="rounded-xl p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 dark:text-amber-300 font-semibold block">
                    {isFr
                      ? 'Important : Responsabilité relative aux documents importés'
                      : 'Important: Responsibility regarding imported documents'}
                  </strong>
                  <span className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                    {isFr
                      ? 'Avant de commencer, vous devez prendre connaissance de la clause de non-responsabilité juridique concernant les fichiers et données introduits.'
                      : 'Before proceeding, please review the legal disclaimers regarding documents and files processed within the application.'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <div className="rounded-xl p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-300 text-sm">
                  <Scale className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span>
                    {isFr
                      ? 'DÉCHARGE EXPRESSE DE RESPONSABILITÉ SUR LES DONNÉES FOURNIES'
                      : 'EXPRESS DISCLAIMER OF LIABILITY REGARDING USER DATA'}
                  </span>
                </div>
                <p className="text-rose-800 dark:text-rose-200/90 leading-relaxed">
                  {isFr
                    ? 'L’auteur, le mainteneur et les contributeurs du logiciel OCRBookor déclinent expressément toute responsabilité, directe ou indirecte, quant à la nature, l’origine, l’exactitude, la licéité, la confidentialité ou les droits de propriété intellectuelle liés aux données, images, fichiers PDF et textes importés, traités ou exportés dans cette application.'
                    : 'The author, maintainers, and contributors of OCRBookor expressly disclaim any and all liability, direct or indirect, regarding the nature, origin, accuracy, legality, confidentiality, or intellectual property rights related to data, scans, PDF files, and texts imported, processed, or exported in this application.'}
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {isFr ? '1. Propriété intellectuelle et Droits d’Auteur' : '1. Intellectual Property & Copyright'}
                  </h4>
                  <p>
                    {isFr
                      ? 'L’utilisateur est seul et entièrement responsable de s’assurer qu’il détient les droits nécessaires (domaine public, licence légale ou exception de copie privée) sur tout document qu’il convertit.'
                      : 'The user is solely and entirely responsible for ensuring they hold all necessary rights (public domain, copyright license, or private copy exceptions) for any book or file processed.'}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {isFr ? '2. Protection des Données et Confidentialité' : '2. Data Protection & Privacy'}
                  </h4>
                  <p>
                    {isFr
                      ? 'L’application fonctionnant intégralement en local (sur votre machine hôte ou navigateur), aucun hébergement ni stockage centralisé n’est effectué par l’éditeur.'
                      : 'As the software operates entirely locally on your host device or browser, no centralized storage or processing is executed by the developers.'}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {isFr ? '3. Absence de Garantie de Transcription' : '3. No Guarantee of OCR Accuracy'}
                  </h4>
                  <p>
                    {isFr
                      ? 'La reconnaissance optique de caractères (OCR) est fournie « en l’état ». Une relecture humaine reste nécessaire avant toute publication.'
                      : 'Optical character recognition (OCR) is provided "as is". Human proofreading remains recommended before any commercial or public distribution.'}
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
                {isFr ? (
                  <>
                    <strong>Je reconnais avoir pris connaissance des mentions légales</strong> et j’accepte expressément la clause déchargeant l’auteur d’OCRBookor de toute responsabilité relative aux fichiers et données que j’introduis ou exporte dans l’application.
                  </>
                ) : (
                  <>
                    <strong>I acknowledge that I have read the legal notice</strong> and expressly accept the clause releasing the authors of OCRBookor from any liability regarding files and data imported or exported.
                  </>
                )}
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
              {t('common.close')}
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              {isFr ? 'Acceptation requise pour démarrer' : 'Acceptance required to begin'}
            </span>
          )}

          <div className="flex items-center gap-2">
            {activeTab === 'presentation' && (
              <button
                type="button"
                onClick={() => setActiveTab('mentions')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-3 py-2"
              >
                {isFr ? 'Lire les mentions légales →' : 'Read legal notice →'}
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
              <span>{isFr ? 'Accepter et Commencer' : 'Accept and Begin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
