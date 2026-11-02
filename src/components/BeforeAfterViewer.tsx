import React, { useState } from 'react';
import { Eye, FileCode2, BookOpen, Layers, CheckCircle2, Sparkles, MoveRight } from 'lucide-react';

export const BeforeAfterViewer: React.FC = () => {
  const [activeStep, setActiveStep] = useState<'scan' | 'ocr' | 'reconstructed'>('reconstructed');

  return (
    <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-lg transition-all">
      {/* Sélecteur d'étapes */}
      <div className="bg-stone-100 dark:bg-stone-950/80 border-b border-stone-200 dark:border-stone-800 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span className="text-xs font-serif font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
            Démonstration interactive de transformation
          </span>
        </div>

        <div className="inline-flex rounded-lg bg-stone-200/70 dark:bg-stone-800 p-1 text-xs">
          <button
            onClick={() => setActiveStep('scan')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeStep === 'scan'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            1. Scan Brut
          </button>
          <button
            onClick={() => setActiveStep('ocr')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeStep === 'ocr'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            2. Calque OCR
          </button>
          <button
            onClick={() => setActiveStep('reconstructed')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              activeStep === 'reconstructed'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            3. EPUB Reconstruit
          </button>
        </div>
      </div>

      {/* Contenu visuel selon l'étape */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
        {/* Colonne gauche : Aperçu graphique */}
        <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-center items-center bg-stone-900/5 dark:bg-black/30 border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-stone-800">
          {activeStep === 'scan' && (
            <div className="w-full max-w-md bg-[#F4ECD8] text-stone-900 p-6 rounded-lg shadow-md border border-[#E2D5BA] font-serif select-none relative overflow-hidden">
              <div className="absolute top-2 right-3 text-[10px] text-stone-500 font-mono">p. 143</div>
              <div className="text-center font-bold tracking-widest text-xs uppercase mb-3 text-stone-700">
                LES HISTOIRES NATURELLES
              </div>
              <div className="w-16 h-px bg-stone-400 mx-auto mb-4" />
              <div className="text-[12px] leading-relaxed text-stone-800 opacity-90 italic">
                « Tous les feux des réjouissances n’étaient que la figure de cette flamme pure &amp; céleste qui devait embraser les cœurs ; &amp; les cris d’allégresse n’exprimaient que foiblement le triomphe de la vérité... »
              </div>
              <div className="my-4 p-3 bg-stone-300/40 rounded border border-stone-400/40 text-center">
                <span className="text-[11px] text-stone-600 italic">[Gravure sur cuivre n° XII — Buffon, Histoire des Quadrupèdes]</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-700">
                On remarquera que dans ce livre imprimé en 1778, les ligatures et les tirets de fin de ligne (dé-césure nécessaire) compliquent l'extraction directe sans un moteur adapté.
              </p>
              <div className="mt-3 inline-block px-2 py-0.5 bg-amber-800/20 text-amber-900 rounded text-[10px] font-mono">
                Résolution : 300 DPI | Binarisation Otsu requise
              </div>
            </div>
          )}

          {activeStep === 'ocr' && (
            <div className="w-full max-w-md bg-stone-950 text-stone-200 p-5 rounded-lg shadow-md font-mono text-xs relative">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3 text-[11px] text-stone-400">
                <span>Tesseract v5 WebAssembly</span>
                <span className="text-emerald-400">Confiance globale : 97.4%</span>
              </div>
              <div className="space-y-2 text-[11.5px] leading-relaxed">
                <p>
                  <span className="bg-emerald-950/80 text-emerald-300 px-1 rounded border border-emerald-800">Tous (99%)</span>{' '}
                  <span className="bg-emerald-950/80 text-emerald-300 px-1 rounded border border-emerald-800">les (99%)</span>{' '}
                  <span className="bg-amber-950/80 text-amber-300 px-1 rounded border border-amber-800">feux (88%)</span>{' '}
                  <span className="bg-emerald-950/80 text-emerald-300 px-1 rounded border border-emerald-800">des (99%)</span>{' '}
                  <span className="bg-amber-950/80 text-amber-300 px-1 rounded border border-amber-800">réjouis- (84%)</span>
                </p>
                <p className="text-rose-400 text-[10px]">
                  ⚠️ Césure détectée : "réjouis-" + "sances" ➔ reconstruction requise
                </p>
                <p>
                  <span className="bg-emerald-950/80 text-emerald-300 px-1 rounded border border-emerald-800">sances</span>{' '}
                  <span className="bg-emerald-950/80 text-emerald-300 px-1 rounded border border-emerald-800">n'étoient</span>{' '}
                  <span className="bg-emerald-950/80 text-emerald-300 px-1 rounded border border-emerald-800">que</span>{' '}
                  <span className="bg-emerald-950/80 text-emerald-300 px-1 rounded border border-emerald-800">la</span>{' '}
                  <span className="bg-emerald-950/80 text-emerald-300 px-1 rounded border border-emerald-800">figure...</span>
                </p>
                <div className="p-2 bg-stone-900 rounded border border-stone-800 text-[10px] text-stone-400 mt-3">
                  Coordonnées boîtes de mots extraites : x: 142, y: 388, w: 612, h: 28 px.
                </div>
              </div>
            </div>
          )}

          {activeStep === 'reconstructed' && (
            <div className="w-full max-w-md bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-6 rounded-lg shadow-xl border border-stone-200 dark:border-stone-800 font-serif">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-3 text-xs">
                <span className="font-sans font-bold text-amber-700 dark:text-amber-400">EPUB 3 Strict &amp; Markdown</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-sans">
                  <CheckCircle2 className="w-3 h-3" /> Typographie Imprimerie Nationale
                </span>
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-2">
                Chapitre XII — Des Animaux Quadrupèdes
              </h2>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 indent-4 mb-2">
                «&nbsp;Tous les feux des réjouissances n'étaient que la figure de cette flamme pure et céleste qui devait embraser les cœurs&nbsp;;&nbsp;et les cris d'allégresse n'exprimaient que faiblement le triomphe de la vérité.&nbsp;»
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded border border-amber-200/60 dark:border-amber-900/40 text-[11px] font-sans text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-600" /> Règles appliquées automatiquement :
                </div>
                <div className="text-[10.5px] text-stone-600 dark:text-stone-400">
                  • Césure recollée : <em>réjouis-</em> + <em>sances</em> ➔ <strong>réjouissances</strong><br />
                  • Espaces insécables ajoutés devant <strong>;</strong> et <strong>?</strong><br />
                  • Guillemets français <strong>«&nbsp;</strong> et <strong>&nbsp;»</strong> normalisés
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite : Explication pédagogique */}
        <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 mb-3">
              {activeStep === 'scan' && 'Étape 1 : Numérisation'}
              {activeStep === 'ocr' && 'Étape 2 : Reconnaissance de caractères'}
              {activeStep === 'reconstructed' && 'Étape 3 : Structuration éditoriale'}
            </div>

            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              {activeStep === 'scan' && 'Le document scanné : une simple matrice d’images'}
              {activeStep === 'ocr' && 'L’océrisation : extraction brute et calque de confiance'}
              {activeStep === 'reconstructed' && 'Le document final : prêt pour liseuse et archivage'}
            </h3>

            <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {activeStep === 'scan' &&
                'Un fichier PDF numérisé ne contient aucun texte vectoriel : chaque page est une photographie. La recherche plein texte est impossible, le texte est souvent incliné (skew) et le papier présente du bruit optique.'}
              {activeStep === 'ocr' &&
                'OCRBookor exécute Tesseract v5 en local. Chaque glyphe est identifié avec son indice de certitude (de 0 à 100%) et ses coordonnées spatiales précises pour permettre une relecture visuelle bi-fenêtre.'}
              {activeStep === 'reconstructed' &&
                'Le moteur applique les règles typographiques de l’Imprimerie Nationale, ressoude les césures de bout de ligne et structure le livre en chapitres Dublin Core dans un EPUB 3 validé IDPF.'}
            </p>

            <ul className="mt-4 space-y-2 text-xs text-stone-700 dark:text-stone-300">
              {activeStep === 'scan' && (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Inspection automatique de la résolution DPI réelle
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Redressement automatique (-10° à +10°)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Binarisation adaptative par méthode d'Otsu
                  </li>
                </>
              )}
              {activeStep === 'ocr' && (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    100% Hors-ligne : zéro donnée envoyée sur le cloud
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Indice de certitude coloré au mot près
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Détection des anomalies et caractères suspects
                  </li>
                </>
              )}
              {activeStep === 'reconstructed' && (
                <>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    EPUB 3.3 strict conforme W3C / IDPF
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Markdown avec en-têtes YAML Dublin Core
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Liseuse web intégrée avec thèmes Clair / Sépia / Nuit
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-serif italic">Suite logicielle OCRBookor</span>
            <button
              onClick={() => {
                if (activeStep === 'scan') setActiveStep('ocr');
                else if (activeStep === 'ocr') setActiveStep('reconstructed');
                else setActiveStep('scan');
              }}
              className="font-medium text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Étape suivante <MoveRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
