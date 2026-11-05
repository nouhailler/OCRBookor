import React, { useState } from 'react';
import {
  Download,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Terminal,
  ExternalLink,
  Laptop,
  Check,
  FileCheck,
  FileCode,
  Globe,
  Sliders,
  Type,
  Maximize2,
  HardDrive,
  GitBranch,
  BookMarked,
  Copy
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { BeforeAfterViewer } from './BeforeAfterViewer';
import { useTranslation } from '../i18n';

interface LandingViewProps {
  onLaunchApp: () => void;
  onOpenDocs?: (key: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onLaunchApp }) => {
  const { language, toggleLanguage } = useTranslation();
  const isFr = language === 'fr';

  // État des accordéons de la FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleCopyCurl = () => {
    navigator.clipboard.writeText('curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/install.sh | sudo bash');
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#111625] text-stone-900 dark:text-stone-100 font-sans selection:bg-amber-600/20 selection:text-amber-900 transition-colors duration-300">
      
      {/* ==================================================================== */}
      {/* BARRE DE NAVIGATION SUPÉRIEURE ÉDITORIALE */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 dark:bg-[#111625]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Titre */}
          <a href="#hero" className="flex items-center gap-3 group focus:outline-hidden">
            <img src="/logo.svg" alt="OCRBookor Logo" className="w-9 h-9 transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-stone-950 dark:text-white flex items-center gap-1.5">
                OCRBookor
                <span className="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  v1.3.0
                </span>
              </span>
              <span className="text-[10px] text-stone-600 dark:text-stone-300 -mt-0.5 font-medium tracking-wide">
                {isFr ? 'Numérisation & Reconstruction EPUB 3' : 'Digitization & EPUB 3 Reconstruction'}
              </span>
            </div>
          </a>

          {/* Navigation rapide ancres desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-stone-700 dark:text-stone-200">
            <a href="#pipeline" className="hover:text-amber-700 dark:hover:text-amber-400 transition">Pipeline</a>
            <a href="#fonctionnalites" className="hover:text-amber-700 dark:hover:text-amber-400 transition">{isFr ? 'Fonctionnalités' : 'Features'}</a>
            <a href="#formats" className="hover:text-amber-700 dark:hover:text-amber-400 transition">{isFr ? 'Formats d’Export' : 'Export Formats'}</a>
            <a href="#demonstration" className="hover:text-amber-700 dark:hover:text-amber-400 transition">{isFr ? 'Démonstration' : 'Demo'}</a>
            <a href="#telechargement" className="hover:text-amber-700 dark:hover:text-amber-400 transition">{isFr ? 'Téléchargement' : 'Download'}</a>
            <a href="#faq" className="hover:text-amber-700 dark:hover:text-amber-400 transition">FAQ</a>
          </nav>

          {/* Boutons d'action : Langue + PWA + Lancement App */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Langue FR / EN */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition"
              title={isFr ? 'Switch to English' : 'Passer en français'}
              aria-label="Switch language"
            >
              <span className={language === 'fr' ? 'text-amber-700 dark:text-amber-400 font-extrabold' : 'text-stone-400 font-medium'}>FR</span>
              <span className="text-stone-300 dark:text-stone-600">/</span>
              <span className={language === 'en' ? 'text-amber-700 dark:text-amber-400 font-extrabold' : 'text-stone-400 font-medium'}>EN</span>
            </button>

            <PWAInstallButton />

            <button
              onClick={onLaunchApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-white shadow-xs transition"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isFr ? "Lancer l'Application" : "Launch Studio App"}</span>
              <span className="sm:hidden">App</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* SECTION 1 — HERO : DU LIVRE SCANNÉ AU DOCUMENT NUMÉRIQUE STRUCTURÉ */}
      {/* ==================================================================== */}
      <section id="hero" className="relative pt-12 pb-20 overflow-hidden border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Colonne Gauche : Présentation & CTA */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badges vérifiés */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {isFr ? '100% Hors-Ligne & Souverain' : '100% Offline & Sovereign'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                  {isFr ? 'IDPF EPUB 3.3 Strict' : 'Strict IDPF EPUB 3.3'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-200/80 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  Linux Desktop (.deb) &amp; Web
                </span>
              </div>

              {/* Titre Principal Éditorial */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-stone-950 dark:text-white leading-[1.15]">
                {isFr ? 'Du livre scanné au document numérique structuré' : 'From scanned books to structured digital documents'}
              </h1>

              {/* Paragraphe d'introduction honnête & vérifié */}
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl">
                {isFr
                  ? "OCRBookor vous accompagne dans la transformation de livres numérisés en PDF en documents numériques reconnus, reconstruits et exploitables. Découvrez une suite logicielle conçue pour faciliter le traitement et la valorisation des livres scannés, sans dépendance au cloud."
                  : "OCRBookor guides you through transforming scanned PDF books into recognized, reconstructed, and fully exploitable digital documents. Experience a software suite crafted to process and preserve heritage printed books without cloud dependencies."}
              </p>

              {/* Actions principales */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <a
                  href="https://github.com/nouhailler/OCRBookor/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800 shadow-md hover:shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  {isFr ? 'Télécharger OCRBookor (v1.3.0)' : 'Download OCRBookor (v1.3.0)'}
                </a>

                <a
                  href="#pipeline"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition"
                >
                  {isFr ? 'Découvrir le fonctionnement' : 'Explore Workflow'}
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </a>

                <button
                  onClick={onLaunchApp}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-100/50 dark:hover:bg-stone-800/40 transition"
                >
                  <Laptop className="w-4 h-4 text-stone-400" />
                  {isFr ? "Tester l'application Web" : 'Test Web Application'}
                </button>
              </div>

              {/* Métadonnées de version & prérequis vérifiés */}
              <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="block text-stone-600 dark:text-stone-300 font-medium">{isFr ? 'Version Stable' : 'Stable Version'}</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{isFr ? 'v1.3.0 (5 Nov. 2026)' : 'v1.3.0 (Nov. 5, 2026)'}</span>
                </div>
                <div>
                  <span className="block text-stone-600 dark:text-stone-300 font-medium">{isFr ? 'Paquet Linux Officiel' : 'Official Linux Package'}</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">Debian / Ubuntu (.deb)</span>
                </div>
                <div>
                  <span className="block text-stone-600 dark:text-stone-300 font-medium">{isFr ? 'Licence' : 'License'}</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{isFr ? 'Apache 2.0 / Libre' : 'Apache 2.0 / Open Source'}</span>
                </div>
              </div>

            </div>

            {/* Colonne Droite : Visuel Authentique de l'application */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-300/80 dark:border-stone-800 bg-stone-900 group">
                <img
                  src="/docs/images/screenshot.jpg"
                  alt="Authentic screenshot of OCRBookor"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-stone-950/80 backdrop-blur-xs border border-stone-800 text-[11px] text-stone-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{isFr ? 'Écran 4 : Éditeur Bi-Fenêtre Synchronisé' : 'Screen 4: Synchronized Dual-Pane Editor'}</span>
                    <span className="text-stone-400">{isFr ? 'Scan historique vs texte océrisé avec indices de certitude' : 'Historical scan vs OCR text with confidence ratings'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono text-[10px] border border-emerald-700">
                    {isFr ? 'Confiance 98.7%' : '98.7% Confidence'}
                  </span>
                </div>
              </div>

              {/* Note de véracité documentaire */}
              <p className="mt-2 text-center text-[11px] text-stone-600 dark:text-stone-300 italic">
                {isFr ? 'Capture réelle du logiciel en situation de relecture sur une édition de 1778.' : 'Actual screenshot of the software during proofreading of a 1778 edition.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 2 — LE PROBLÈME : UN PDF SCANNÉ N'EST PAS UN LIVRE EXPLOITABLE */}
      {/* ==================================================================== */}
      <section id="probleme" className="py-16 sm:py-20 border-b border-stone-200/60 dark:border-stone-800/60 bg-stone-100/60 dark:bg-stone-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {isFr ? 'Le constat documentaire' : 'Documentary Assessment'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              {isFr ? 'Pourquoi un PDF scanné ne suffit pas' : 'Why a scanned PDF is not enough'}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              {isFr
                ? 'La numérisation brute d’un ouvrage produit le plus souvent un fichier PDF contenant uniquement des photographies de pages. Sans traitement adapté, ces documents posent des limites majeures.'
                : 'Raw scanning of a book usually produces a PDF containing only page photographs. Without proper processing, these documents present major limitations.'}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Texte inerte & recherche impossible' : 'Inert text & impossible search'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr
                  ? 'Le texte ne peut pas être sélectionné, copié ou indexé. Les synthèses vocales et liseuses électroniques ne peuvent pas le lire, et les moteurs de recherche restent aveugles face aux images brutes.'
                  : 'Text cannot be selected, copied, or indexed. Text-to-speech and e-readers cannot read it, and search engines remain blind to raw images.'}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Défauts physiques & inclinaison' : 'Physical flaws & skew'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr
                  ? "Les pages scannées souffrent souvent d'inclinaison (skew), de courbure de reliure, de taches d'encre ou d'un contraste affaibli par le jaunissement du papier d'époque."
                  : "Scanned pages often suffer from rotation skew, binding curve distortion, ink smudges, or contrast degraded by yellowed aged paper."}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Césures brisées & typographie dégradée' : 'Broken hyphens & degraded typography'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr
                  ? "Une extraction brute découpe les mots en fin de ligne (ex. « dé- » / « veloppement ») et ignore les règles typographiques françaises (espaces insécables devant la ponctuation double, guillemets cadratins, ligatures)."
                  : "Raw extraction breaks words at line ends (e.g., 'trans-' / 'formation') and ignores typographic rules (non-breaking spaces, quotation marks, ligatures)."}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {isFr ? "La réponse d'OCRBookor" : 'The OCRBookor solution'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr
                  ? 'OCRBookor applique un pipeline rigoureux : analyse de la résolution DPI, redressement automatique, binarisation Otsu, détection des césures, correction bi-fenêtre et structuration en EPUB 3 et Markdown.'
                  : 'OCRBookor applies a rigorous pipeline: DPI resolution analysis, automatic deskewing, Otsu binarization, dehyphenation, dual-pane correction, and structuring into EPUB 3 and Markdown.'}
              </p>
            </div>

          </div>

          {/* Avertissement transparent sur les limites */}
          <div className="mt-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">{isFr ? 'Périmètre technique vérifié : ' : 'Verified technical scope: '}</span>
              {isFr
                ? "OCRBookor est optimisé pour les textes imprimés (caractères au plomb ou impression moderne). Il ne prend pas en charge les écritures manuscrites cursives ni les formules mathématiques complexes. La qualité du texte final dépend de la résolution du scan source et requiert une étape de vérification humaine que le logiciel facilite grâce à son éditeur bi-fenêtre."
                : "OCRBookor is optimized for printed books (movable type or modern print). It does not handle cursive handwriting or complex mathematical formulas. Final text quality depends on source scan resolution and benefits from human verification, made seamless by the dual-pane editor."}
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 3 — LE PIPELINE RÉEL EN 5 ÉTAPES */}
      {/* ==================================================================== */}
      <section id="pipeline" className="py-16 sm:py-20 border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {isFr ? 'Méthodologie Documentaire' : 'Documentary Methodology'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              {isFr ? 'Comment fonctionne OCRBookor ?' : 'How does OCRBookor work?'}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              {isFr
                ? "Un pipeline complet articulé autour de 5 étapes vérifiables dans le code source de l’application."
                : 'A complete pipeline structured around 5 verifiable steps in the application source code.'}
            </p>
          </div>

          {/* Étapes du pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Étape 1 */}
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative space-y-2">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">01 / 05</span>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-stone-500" />
                {isFr ? 'Importer' : 'Import'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? "Glisser-déposer de livres scannés au format PDF. Détection du nombre de pages et analyse du flux d'images." : 'Drag and drop scanned PDF books. Page count detection and image stream inspection.'}
              </p>
            </div>

            {/* Étape 2 */}
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative space-y-2">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">02 / 05</span>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-stone-500" />
                {isFr ? 'Analyser' : 'Analyze'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? "Calcul de la résolution réelle (DPI), redressement d'angle (Deskew) et binarisation adaptative par méthode d'Otsu." : 'Real DPI resolution calculation, angle deskewing, and adaptive Otsu binarization.'}
              </p>
            </div>

            {/* Étape 3 */}
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative space-y-2">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">03 / 05</span>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-stone-500" />
                {isFr ? 'Reconnaître' : 'Recognize'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? "Moteur Tesseract v5 en WebAssembly ou CLI. Calcul de la confiance au mot près et extraction des coordonnées spatiales." : 'Tesseract v5 engine in WebAssembly or native CLI. Word-level confidence calculation and bounding box extraction.'}
              </p>
            </div>

            {/* Étape 4 */}
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative space-y-2">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">04 / 05</span>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-stone-500" />
                {isFr ? 'Reconstruire' : 'Reconstruct'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? "Recollage des césures de bout de ligne, règles typographiques françaises (espaces insécables, guillemets, ligatures)." : 'Rejoining line-wrap hyphenated words, publishing typography rules (non-breaking spaces, guillemets, ligatures).'}
              </p>
            </div>

            {/* Étape 5 */}
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative space-y-2">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">05 / 05</span>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-stone-500" />
                {isFr ? 'Exporter' : 'Export'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? "Génération d'EPUB 3 conforme W3C/IDPF, Markdown avec métadonnées Dublin Core, HTML5 autonome et texte brut UTF-8." : 'Generation of W3C/IDPF compliant EPUB 3, Markdown with Dublin Core metadata, standalone HTML5, and UTF-8 plain text.'}
              </p>
            </div>

          </div>

          {/* Démonstrateur interactif Avant / Après */}
          <div className="mt-12">
            <BeforeAfterViewer />
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 4 — LES FONCTIONNALITÉS CONFIRMÉES D'OCRBOOKOR */}
      {/* ==================================================================== */}
      <section id="fonctionnalites" className="py-16 sm:py-20 border-b border-stone-200/60 dark:border-stone-800/60 bg-stone-100/40 dark:bg-stone-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {isFr ? 'Capacités Vérifiées' : 'Verified Capabilities'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              {isFr ? 'Une suite logicielle complète & spécialisée' : 'A complete & specialized software suite'}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              {isFr ? 'Toutes les fonctionnalités ci-dessous sont implémentées et testées dans le dépôt officiel.' : 'All features below are implemented and tested in the official repository.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* F1 : Hors-ligne */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isFr ? '100% Souverain & Hors-Ligne' : '100% Sovereign & Offline'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? "Aucun document n'est transmis à un serveur distant. Vos livres, archives privées ou documents patrimoniaux restent strictement sur votre machine." : 'No document is ever transmitted to a remote server. Your books, private archives, and heritage documents remain strictly on your machine.'}
              </p>
            </div>

            {/* F2 : Éditeur bi-fenêtre */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Éditeur Bi-Fenêtre Synchronisé' : 'Synchronized Dual-Pane Editor'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? "Le scan haute résolution avec zoom et calque de coordonnées à gauche fait face au texte éditable à droite, avec surlignage des mots à faible confiance." : 'High-resolution zoomable scan with coordinate overlay on the left faces the editable text pane on the right, highlighting low-confidence words.'}
              </p>
            </div>

            {/* F3 : Typographie française */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Type className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Normes Imprimerie Nationale' : 'Editorial Typography Standards'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? (
                  <>Application automatique des espaces insécables devant <code>! ? ; : % €</code>, des guillemets français <code>« »</code> et des ligatures <code>œ</code> et <code>æ</code>.</>
                ) : (
                  <>Automatic non-breaking spaces before <code>! ? ; : % €</code>, French guillemets <code>« »</code>, and ligatures <code>œ</code> and <code>æ</code>.</>
                )}
              </p>
            </div>

            {/* F4 : Dé-césure */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Dé-césure Intelligente' : 'Smart Dehyphenation'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? 'Ressoude les mots coupés en fin de ligne tout en préservant les mots composés légitimes grâce à un dictionnaire lexical de contrôle.' : 'Rejoins words split at line ends while preserving legitimate compound words using a control lexical dictionary.'}
              </p>
            </div>

            {/* F5 : Extraction gravures */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                <Maximize2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Gravures & Illustrations' : 'Engravings & Illustrations'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? "Extraction des planches et illustrations avec gestionnaire de légendes et intégration propre dans le livre numérique final." : 'Extraction of plates and illustrations with caption management and clean integration into the final digital book.'}
              </p>
            </div>

            {/* F6 : Métadonnées Dublin Core */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                <BookMarked className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Structure & Dublin Core' : 'Structure & Dublin Core'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? 'Organisation en chapitres (H1, H2, H3) et saisie des métadonnées normalisées (Titre, Auteur, Année, Identifiant UUID, Éditeur).' : 'Organization into chapters (H1, H2, H3) and standard metadata entry (Title, Author, Year, UUID Identifier, Publisher).'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 5 — LES DOCUMENTS OBTENUS */}
      {/* ==================================================================== */}
      <section id="formats" className="py-16 sm:py-20 border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {isFr ? 'Diffusion & Archivage' : 'Distribution & Archiving'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              {isFr ? 'Les documents obtenus avec OCRBookor' : 'Documents produced with OCRBookor'}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              {isFr ? "Des livrables standardisés, prêts pour la lecture sur liseuse, l'édition dans Obsidian ou l'indexation de recherche." : 'Standardized deliverables ready for e-reader reading, editing in Obsidian, or search indexing.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Format 1 : EPUB 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border-2 border-amber-600/30 dark:border-amber-500/30 shadow-md space-y-3 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase">
                {isFr ? 'Recommandé' : 'Recommended'}
              </div>
              <FileCheck className="w-8 h-8 text-amber-700 dark:text-amber-400" />
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                EPUB 3.3 Strict
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? (
                  <>Archive conforme IDPF avec <code>mimetype</code> non compressé, <code>content.opf</code>, navigation <code>nav.xhtml</code> et feuille de style typographique. Compatible Kobo, Tolino, Calibre et Apple Books.</>
                ) : (
                  <>IDPF-compliant archive with uncompressed <code>mimetype</code>, <code>content.opf</code>, <code>nav.xhtml</code> navigation, and typographic stylesheet. Compatible with Kobo, Tolino, Calibre, and Apple Books.</>
                )}
              </p>
            </div>

            {/* Format 2 : Markdown */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <FileCode className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Markdown (.md)
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? 'Fichier textuel enrichi d’un frontmatter YAML Dublin Core. Idéal pour intégration dans Obsidian, Logseq, Zotero, Notion ou un dépôt Git.' : 'Text file enriched with Dublin Core YAML frontmatter. Ideal for Obsidian, Logseq, Zotero, Notion, or Git repositories.'}
              </p>
            </div>

            {/* Format 3 : HTML 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <Globe className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'HTML 5 Autonome' : 'HTML 5 Ready'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? 'Page web autonome auto-suffisante avec mise en page responsive, polices à empattements et styles typographiques pour consultation immédiate.' : 'Self-contained standalone web page with responsive layout, serif fonts, and typographic styles for instant consultation.'}
              </p>
            </div>

            {/* Format 4 : Texte brut */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <FileText className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Texte Brut UTF-8 (.txt)' : 'Plain Text (.txt)'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? "Encodage UTF-8 universel avec paragraphes régularisés, idéal pour l'analyse lexicale, les modèles de langage ou l'archivage pérenne." : 'Universal UTF-8 encoding with normalized paragraphs, ideal for text analysis, language models, or long-term archiving.'}
              </p>
            </div>

          </div>

          <div className="mt-8 text-center text-xs text-stone-600 dark:text-stone-300">
            {isFr ? (
              <>* OCRBookor produit également un fichier <strong>book.json</strong> pour sauvegarder l'intégralité du projet (coordonnées des mots, calques OCR et corrections) pour reprise ultérieure.</>
            ) : (
              <>* OCRBookor also generates a <strong>book.json</strong> file to save the full project state (word coordinates, OCR layers, and corrections) for later resumption.</>
            )}
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 6 — À QUI S'ADRESSE OCRBOOKOR ? */}
      {/* ==================================================================== */}
      <section id="publics" className="py-16 sm:py-20 border-b border-stone-200/60 dark:border-stone-800/60 bg-stone-100/50 dark:bg-stone-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {isFr ? 'Cas d’Usage Réels' : 'Real-World Use Cases'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              {isFr ? 'À qui s’adresse OCRBookor ?' : 'Who is OCRBookor for?'}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              {isFr ? 'Une conception pensée pour les professionnels et passionnés du texte écrit.' : 'Designed for professionals and enthusiasts of printed heritage.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Chercheurs & Historiens' : 'Researchers & Historians'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? 'Traitement de sources primaires numérisées, archives et traités anciens avec extraction plein texte vérifiable et citation facilitée dans les travaux académiques.' : 'Processing digitized primary sources, archives, and historical treatises with verifiable full-text extraction and easier academic citation.'}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Bibliophiles & Collectionneurs' : 'Bibliophiles & Collectors'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? "Transformation de scans d'ouvrages rares ou épuisés du domaine public en livres numériques confortables à lire sur liseuse électronique." : 'Transforming scans of rare or out-of-print public domain books into comfortable e-books on electronic readers.'}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Archivistes & Documentalistes' : 'Archivists & Document Librarians'}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr ? 'Numérisation et océrisation souveraine sans abonnement cloud, sans dépendance réseau et avec préservation des métadonnées bibliographiques.' : 'Sovereign digitization and OCR without cloud subscriptions, without network dependencies, and preserving bibliographic metadata.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 7 — POURQUOI CHOISIR OCRBOOKOR ? (FAITS VÉRIFIÉS) */}
      {/* ==================================================================== */}
      <section id="pourquoi" className="py-16 sm:py-20 border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {isFr ? 'Engagements & Rigueur' : 'Commitments & Rigor'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              {isFr ? 'Pourquoi choisir OCRBookor ?' : 'Why choose OCRBookor?'}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              {isFr ? 'Une suite documentaire construite sur des bases techniques éprouvées et transparentes.' : 'A documentary suite built on proven, transparent technical foundations.'}
            </p>
          </div>

          <div className="space-y-4">
            
            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {isFr ? 'Indépendance totale vis-à-vis des services cloud' : 'Complete independence from cloud services'}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {isFr ? "Tous les calculs (redressement, seuillage, OCR, dé-césure, export) s'exécutent sur votre propre matériel. Aucune création de compte, aucun quota de pages, aucun coût d'API." : 'All computations (deskewing, thresholding, OCR, dehyphenation, export) run strictly on your own hardware. No account creation, no page quotas, no API costs.'}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {isFr ? "Respect des règles d'édition françaises" : 'Respect for publication typography rules'}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {isFr ? "Contrairement aux outils OCR génériques internationaux, OCRBookor intègre les finesses de la typographie française pour éviter les lignes orphelines et les signes de ponctuation mal placés." : 'Unlike generic OCR tools, OCRBookor respects editorial typography subtleties to avoid orphan lines, broken quotes, and misplaced punctuation.'}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {isFr ? 'Transparence scientifique des métriques' : 'Scientific transparency of metrics'}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {isFr ? "Le logiciel refuse d'inventer des taux de précision fictifs : les métriques CER (Character Error Rate) et WER (Word Error Rate) ne sont calculées que si vous fournissez une transcription de référence certifiée." : 'The software refuses to invent fictitious accuracy rates: CER (Character Error Rate) and WER (Word Error Rate) metrics are only computed when a certified reference ground truth is provided.'}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {isFr ? 'Code ouvert & suite de tests automatisée' : 'Open-source code & automated test suite'}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  {isFr ? "20 tests unitaires et d'intégration bout-en-bout valident l'arborescence des fichiers EPUB, la fidélité des distances de Levenshtein et l'intégrité de la base de données SQLite locale." : '20 unit and end-to-end integration tests validate EPUB archive structure, Levenshtein distance precision, and local SQLite database integrity.'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 8 — DÉMONSTRATION VISUELLE AUTHENTIQUE */}
      {/* ==================================================================== */}
      <section id="demonstration" className="py-16 sm:py-20 border-b border-stone-200/60 dark:border-stone-800/60 bg-stone-100/50 dark:bg-stone-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {isFr ? 'Aperçu en situation' : 'Real-World Preview'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              {isFr ? "L'interface d'OCRBookor en action" : 'OCRBookor interface in action'}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              {isFr ? "Découvrez l'écran de correction bi-fenêtre sur le corpus de test réel « Buffon — L'Histoire Naturelle (1778) »." : "Explore the dual-pane correction screen on the real test corpus 'Buffon — L\'Histoire Naturelle (1778)'."}
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-800 shadow-2xl bg-stone-900">
            <img
              src="/docs/images/screenshot.jpg"
              alt="Authentic screenshot of OCRBookor"
              className="w-full h-auto"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">
                {isFr ? 'Navigation par page & laser OCR' : 'Page navigation & OCR laser'}
              </span>
              <p className="text-stone-600 dark:text-stone-400">
                {isFr ? "La ligne lumineuse indique la ligne en cours de traitement pendant l'océrisation et facilite le repérage visuel lors de la relecture." : 'The laser line indicates the line currently being processed during OCR and eases visual focus during proofreading.'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">
                {isFr ? 'Indices de confiance colorés' : 'Color-coded confidence ratings'}
              </span>
              <p className="text-stone-600 dark:text-stone-400">
                {isFr ? 'Chaque mot incertain est surligné (vert >90%, orange 60-90%, rouge <60%) pour cibler immédiatement les zones à vérifier.' : 'Each uncertain word is highlighted (green >90%, amber 60-90%, red <60%) to immediately pinpoint spots to review.'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">
                {isFr ? 'Palette de caractères spéciaux' : 'Special character palette'}
              </span>
              <p className="text-stone-600 dark:text-stone-400">
                {isFr ? 'Boutons d\'insertion rapide pour les caractères rares ou accentués : à è î ô ù ç œ æ.' : 'Quick insertion buttons for accented and rare characters: à è î ô ù ç œ æ.'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 9 — INSTALLATION ET TÉLÉCHARGEMENT (VÉRIFIÉS) */}
      {/* ==================================================================== */}
      <section id="telechargement" className="py-16 sm:py-20 border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {isFr ? 'Distribution & Binaires' : 'Distribution & Binaries'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              {isFr ? 'Commencez à transformer vos livres scannés' : 'Start transforming your scanned books'}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              {isFr ? 'Installez OCRBookor en une seule ligne de commande ou téléchargez directement le paquet Debian officiel.' : 'Install OCRBookor with a single command line or download the official Debian package directly.'}
            </p>
          </div>

          {/* Méthode Express Recommandée : 1 ligne via curl */}
          <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-linear-to-br from-amber-900/10 via-amber-800/5 to-transparent border-2 border-amber-600/80 dark:border-amber-500 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-700 text-white tracking-wider">
                  {isFr ? 'Méthode Express Recommandée' : 'Recommended Express Method'}
                </span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  {isFr ? 'Installation directe via curl (toujours à jour)' : 'Direct installation via curl (always up to date)'}
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-mono">Debian 12/13, Ubuntu 22.04/24.04, Linux Mint</span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 mb-3 leading-relaxed">
              {isFr
                ? <>Cette commande télécharge automatiquement la dernière version du binaire, l'installe proprement avec <code>dpkg</code>, résout toutes les dépendances et configure l'exécutable <code>/usr/bin/ocrbookor</code> :</>
                : <>This command automatically downloads the latest release binary, cleanly installs it via <code>dpkg</code>, resolves all dependencies, and sets up the <code>/usr/bin/ocrbookor</code> executable:</>}
            </p>

            <div className="relative flex items-center bg-stone-950 text-stone-100 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-stone-800">
              <span className="select-none text-amber-500 mr-2 font-bold">$</span>
              <code className="text-emerald-400 flex-1 whitespace-nowrap">curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/install.sh | sudo bash</code>
              <button
                onClick={handleCopyCurl}
                className={`ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 border border-stone-700 ${
                  copiedCurl ? 'bg-emerald-700 text-white' : 'bg-stone-800 hover:bg-stone-700 text-white'
                }`}
                title="Copier la commande"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{isFr ? 'Copié !' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-300" />
                    <span>{isFr ? 'Copier' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {isFr ? 'Aucun téléchargement manuel' : 'No manual download required'}</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {isFr ? 'Résolution automatique des dépendances' : 'Automatic dependency resolution'}</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {isFr ? <>Exécutable <code>/usr/bin/ocrbookor</code> prêt</> : <>Ready <code>/usr/bin/ocrbookor</code> system launcher</>}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Carte Linux Desktop .deb */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {isFr ? 'Téléchargement Manuel (.deb)' : 'Manual Download (.deb)'}
                </span>
                <span className="text-xs font-mono text-stone-600 dark:text-stone-300">v1.3.0 • 2.1 Mo</span>
              </div>

              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Paquet Linux Debian / Ubuntu (.deb)' : 'Linux Debian / Ubuntu Package (.deb)'}
              </h3>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr
                  ? <>Compatible Debian 12/13, Ubuntu 22.04/24.04 LTS, Linux Mint. Installe le lanceur <code>/usr/bin/ocrbookor</code> et le raccourci dans le menu des applications.</>
                  : <>Compatible with Debian 12/13, Ubuntu 22.04/24.04 LTS, Linux Mint. Installs the <code>/usr/bin/ocrbookor</code> launcher and application menu shortcut.</>}
              </p>

              <div className="p-3 bg-stone-900 text-stone-200 rounded-lg text-xs font-mono space-y-1">
                <div className="text-stone-500">{isFr ? '# Téléchargement & installation' : '# Download & install'}</div>
                <div>sudo dpkg -i ocrbookor_1.3.0_amd64.deb</div>
                <div>sudo apt-get install -f</div>
                <div>ocrbookor</div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://github.com/nouhailler/OCRBookor/releases/tag/v1.3.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-amber-700 text-white hover:bg-amber-800 transition"
                >
                  <Download className="w-4 h-4" />
                  {isFr ? 'Télécharger le .deb sur GitHub Releases' : 'Download .deb on GitHub Releases'}
                </a>

                <a
                  href="https://github.com/nouhailler/OCRBookor/raw/main/releases/ocrbookor_1.3.0_amd64.deb"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  {isFr ? 'Lien direct binaire' : 'Direct binary link'}
                </a>
              </div>
            </div>

            {/* Carte Dépôt Source & Web */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  {isFr ? 'Code Source Libre' : 'Open Source Code'}
                </span>
                <span className="text-xs font-mono text-stone-600 dark:text-stone-300">Apache 2.0 / MIT</span>
              </div>

              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {isFr ? 'Dépôt GitHub & Version Web' : 'GitHub Repository & Web Version'}
              </h3>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {isFr
                  ? "Clonez le dépôt pour exécuter l'application localement dans Node.js ou explorez la suite de tests automatisée."
                  : 'Clone the repository to run the app locally with Node.js or explore the automated test suite.'}
              </p>

              <div className="p-3 bg-stone-900 text-stone-200 rounded-lg text-xs font-mono space-y-1">
                <div className="text-stone-500">{isFr ? '# Cloner et lancer localement' : '# Clone and run locally'}</div>
                <div>git clone https://github.com/nouhailler/OCRBookor.git</div>
                <div>cd OCRBookor &amp;&amp; npm install</div>
                <div>npm run dev</div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://github.com/nouhailler/OCRBookor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold border border-stone-900 dark:border-white text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  <GitBranch className="w-4 h-4" />
                  {isFr ? 'Consulter le dépôt GitHub' : 'View GitHub Repository'}
                </a>

                <button
                  onClick={onLaunchApp}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
                >
                  {isFr ? 'Tester dans le navigateur' : 'Test in browser'}
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 10 — QUESTIONS FRÉQUENTES (FAQ AUTHENTIQUE & VÉRIFIÉE) */}
      {/* ==================================================================== */}
      <section id="faq" className="py-16 sm:py-20 border-b border-stone-200/60 dark:border-stone-800/60 bg-stone-100/50 dark:bg-stone-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-serif font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              {isFr ? 'Foire Aux Questions' : 'Frequently Asked Questions'}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              {isFr ? 'Questions fréquentes' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              {isFr ? 'Des réponses claires et sans promesse abusive, fondées sur les capacités réelles du logiciel.' : 'Clear and honest answers based on the real capabilities of the software.'}
            </p>
          </div>

          <div className="space-y-3">
            
            {/* Q1 */}
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 focus:outline-hidden"
              >
                <span>{isFr ? "Qu'est-ce qu'OCRBookor exactement ?" : 'What exactly is OCRBookor?'}</span>
                {openFaq === 0 ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === 0 && (
                <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                  {isFr
                    ? "OCRBookor est une suite logicielle documentaire autonome permettant d'importer des livres numérisés au format PDF, de les prétraiter (calcul DPI, redressement, binarisation Otsu), de reconnaître leur texte via le moteur Tesseract v5 (100% hors-ligne), de réconcilier les coquilles et césures dans un éditeur bi-fenêtre et de produire des livres numériques au format standard EPUB 3, Markdown, HTML et TXT."
                    : 'OCRBookor is an autonomous document software suite that enables importing scanned PDF books, preprocessing them (DPI calculation, deskewing, Otsu binarization), recognizing text via Tesseract v5 (100% offline), reconciling typos and hyphens in a dual-pane editor, and producing standard EPUB 3, Markdown, HTML, and TXT e-books.'}
                </div>
              )}
            </div>

            {/* Q2 */}
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 focus:outline-hidden"
              >
                <span>{isFr ? 'Mes livres et documents sont-ils envoyés sur internet ?' : 'Are my books and documents sent to the internet?'}</span>
                {openFaq === 1 ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === 1 && (
                <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                  {isFr ? (
                    <><strong>Non, jamais.</strong> OCRBookor fonctionne de manière 100% locale et hors-ligne. Le traitement de l'image, la reconnaissance optique et la génération des fichiers EPUB sont exécutés directement sur votre processeur local (via WebAssembly dans l'application web ou nativement via le paquet Linux).</>
                  ) : (
                    <><strong>No, never.</strong> OCRBookor operates 100% locally and offline. Image processing, optical recognition, and EPUB generation run directly on your local CPU (via WebAssembly in the web app or natively via the Linux package).</>
                  )}
                </div>
              )}
            </div>

            {/* Q3 */}
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 focus:outline-hidden"
              >
                <span>{isFr ? "Le logiciel peut-il reconnaître l'écriture manuscrite ?" : 'Can the software recognize handwriting?'}</span>
                {openFaq === 2 ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === 2 && (
                <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                  {isFr ? (
                    <><strong>Non.</strong> OCRBookor v1.3.0 est conçu pour les textes imprimés (typographie au plomb ancienne ou impressions modernes). La reconnaissance de manuscrits, de partitions musicales ou de formules mathématiques complexes n'est pas prise en charge dans cette version.</>
                  ) : (
                    <><strong>No.</strong> OCRBookor v1.3.0 is designed for printed text (lead movable type or modern print). Recognition of manuscripts, musical scores, or complex mathematical formulas is not supported in this version.</>
                  )}
                </div>
              )}
            </div>

            {/* Q4 */}
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 focus:outline-hidden"
              >
                <span>{isFr ? 'Comment installer la landing page comme Progressive Web App (PWA) ?' : 'How do I install the landing page as a Progressive Web App (PWA)?'}</span>
                {openFaq === 3 ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === 3 && (
                <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                  {isFr ? (
                    <>Cliquez sur le bouton <strong>« Installer la PWA »</strong> présent dans la barre supérieure (sur Chrome, Edge ou Android). Sur iOS (iPhone/iPad), touchez le bouton de partage de Safari puis « Sur l'écran d'accueil ». La landing page sera alors accessible même sans connexion internet grâce au Service Worker dédié.</>
                  ) : (
                    <>Click the <strong>"Install PWA"</strong> button in the top bar (on Chrome, Edge, or Android). On iOS (iPhone/iPad), tap Safari's share button then 'Add to Home Screen'. The landing page will then be accessible even without an internet connection thanks to its dedicated Service Worker.</>
                  )}
                </div>
              )}
            </div>

            {/* Q5 */}
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(4)}
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 focus:outline-hidden"
              >
                <span>{isFr ? "Faut-il nécessairement relire le texte après l'OCR ?" : 'Is proofreading required after OCR?'}</span>
                {openFaq === 4 ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === 4 && (
                <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                  {isFr ? (
                    <><strong>Oui, pour un document de qualité éditoriale.</strong> Même si l'OCR atteint plus de 98% de confiance sur un scan propre, des anomalies ponctuelles (lettres anciennes comme le « s » long confondu avec un « f », taches d'encre) peuvent survenir. L'éditeur bi-fenêtre d'OCRBookor est spécifiquement pensé pour rendre cette relecture rapide et fluide.</>
                  ) : (
                    <><strong>Yes, for publication-grade documents.</strong> Even if OCR achieves over 98% confidence on clean scans, occasional anomalies (archaic glyphs like the long 's' confused with 'f', ink blots) can occur. The OCRBookor dual-pane editor is specifically designed to make this proofreading rapid and seamless.</>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 11 — PIED DE PAGE SOBRE & MENTIONS LÉGALES */}
      {/* ==================================================================== */}
      <footer className="py-12 bg-stone-950 text-stone-300 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800/80">
            
            {/* Col 1 : Marque & Présentation */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="OCRBookor" className="w-8 h-8" />
                <span className="font-serif text-lg font-bold text-white tracking-tight">OCRBookor</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">v1.3.0</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-md">
                {isFr
                  ? 'Suite logicielle locale et souveraine dédiée à la numérisation, à la reconnaissance optique de caractères (OCR) et à la reconstruction éditoriale de livres scannés au standard EPUB 3 et Markdown.'
                  : 'Local, sovereign software suite dedicated to digitization, optical character recognition (OCR), and editorial reconstruction of scanned books into standard EPUB 3 and Markdown.'}
              </p>
              <div className="text-[11px] text-stone-500">
                {isFr ? 'Auteur & Maintenance : Patrick Nouhailler' : 'Author & Maintainer: Patrick Nouhailler'}
              </div>
            </div>

            {/* Col 2 : Liens du projet */}
            <div className="space-y-2">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-200">
                {isFr ? 'Ressources Officielles' : 'Official Resources'}
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-400">
                <li>
                  <a
                    href="https://github.com/nouhailler/OCRBookor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1"
                  >
                    {isFr ? 'Dépôt GitHub principal' : 'Main GitHub Repository'} <ExternalLink className="w-3 h-3 text-stone-600" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/nouhailler/OCRBookor/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1"
                  >
                    {isFr ? 'Releases & Binaires .deb' : 'Releases & .deb Binaries'} <ExternalLink className="w-3 h-3 text-stone-600" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/nouhailler/OCRBookor/blob/main/USER_GUIDE.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1"
                  >
                    {isFr ? 'Manuel Utilisateur (USER_GUIDE)' : 'User Guide (USER_GUIDE)'} <ExternalLink className="w-3 h-3 text-stone-600" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/nouhailler/OCRBookor/blob/main/ARCHITECTURE.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1"
                  >
                    {isFr ? 'Architecture Technique' : 'Technical Architecture'} <ExternalLink className="w-3 h-3 text-stone-600" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3 : Déploiement & Format */}
            <div className="space-y-2">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-200">
                {isFr ? 'Hébergement & PWA' : 'Hosting & PWA'}
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                {isFr
                  ? <>Cette landing page est conçue pour être hébergée statiquement sur <strong>Cloudflare Pages</strong> et installable en <strong>PWA</strong> via un Service Worker local.</>
                  : <>This landing page is designed for static hosting on <strong>Cloudflare Pages</strong> and installable as a <strong>PWA</strong> via a local Service Worker.</>}
              </p>
              <div className="pt-2">
                <button
                  onClick={onLaunchApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 text-stone-200 hover:bg-stone-700 transition"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  {isFr ? "Accéder à l'application OCRBookor" : 'Open OCRBookor Studio'}
                </button>
              </div>
            </div>

          </div>

          {/* Décharge légale & Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
            <div>
              {isFr
                ? "© 2026 OCRBookor — Logiciel libre sous licence Apache 2.0. Décharge légale : L'auteur décline toute responsabilité quant aux contenus et données importés par les utilisateurs."
                : '© 2026 OCRBookor — Open source software under Apache 2.0 license. Legal disclaimer: The author disclaims all liability regarding content and data imported by users.'}
            </div>
            <div className="flex items-center gap-4 text-stone-400">
              <a href="#hero" className="hover:text-stone-200 transition">{isFr ? 'Haut de page ↑' : 'Back to top ↑'}</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
