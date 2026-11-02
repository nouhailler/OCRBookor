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
  HelpCircle,
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
  Eye,
  GitBranch,
  Search,
  BookMarked,
  Copy
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { BeforeAfterViewer } from './BeforeAfterViewer';

interface LandingViewProps {
  onLaunchApp: () => void;
  onOpenDocs?: (key: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onLaunchApp }) => {
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
                  v1.2.0
                </span>
              </span>
              <span className="text-[10px] text-stone-600 dark:text-stone-300 -mt-0.5 font-medium tracking-wide">
                Numérisation &amp; Reconstruction EPUB 3
              </span>
            </div>
          </a>

          {/* Navigation rapide ancres desktop */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-stone-700 dark:text-stone-200">
            <a href="#pipeline" className="hover:text-amber-700 dark:hover:text-amber-400 transition">Pipeline</a>
            <a href="#fonctionnalites" className="hover:text-amber-700 dark:hover:text-amber-400 transition">Fonctionnalités</a>
            <a href="#formats" className="hover:text-amber-700 dark:hover:text-amber-400 transition">Formats d’Export</a>
            <a href="#demonstration" className="hover:text-amber-700 dark:hover:text-amber-400 transition">Démonstration</a>
            <a href="#telechargement" className="hover:text-amber-700 dark:hover:text-amber-400 transition">Téléchargement</a>
            <a href="#faq" className="hover:text-amber-700 dark:hover:text-amber-400 transition">FAQ</a>
          </nav>

          {/* Boutons d'action : PWA + Téléchargement + Lancement App */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton />

            <button
              onClick={onLaunchApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-white shadow-xs transition"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lancer l'Application</span>
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
                  100% Hors-Ligne &amp; Souverain
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                  IDPF EPUB 3.3 Strict
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-200/80 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  Linux Desktop (.deb) &amp; Web
                </span>
              </div>

              {/* Titre Principal Éditorial */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-stone-950 dark:text-white leading-[1.15]">
                Du livre scanné au document numérique structuré
              </h1>

              {/* Paragraphe d'introduction honnête & vérifié */}
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl">
                OCRBookor vous accompagne dans la transformation de livres numérisés en PDF en documents numériques reconnus, reconstruits et exploitables. Découvrez une suite logicielle conçue pour faciliter le traitement et la valorisation des livres scannés, sans dépendance au cloud.
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
                  Télécharger OCRBookor (v1.2.0)
                </a>

                <a
                  href="#pipeline"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition"
                >
                  Découvrir le fonctionnement
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </a>

                <button
                  onClick={onLaunchApp}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-stone-100/50 dark:hover:bg-stone-800/40 transition"
                >
                  <Laptop className="w-4 h-4 text-stone-400" />
                  Tester l'application Web
                </button>
              </div>

              {/* Métadonnées de version & prérequis vérifiés */}
              <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="block text-stone-600 dark:text-stone-300 font-medium">Version Stable</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">v1.2.0 (1er Nov. 2026)</span>
                </div>
                <div>
                  <span className="block text-stone-600 dark:text-stone-300 font-medium">Paquet Linux Officiel</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">Debian / Ubuntu (.deb)</span>
                </div>
                <div>
                  <span className="block text-stone-600 dark:text-stone-300 font-medium">Licence</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">Apache 2.0 / Libre</span>
                </div>
              </div>

            </div>

            {/* Colonne Droite : Visuel Authentique de l'application */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-300/80 dark:border-stone-800 bg-stone-900 group">
                <img
                  src="/docs/images/screenshot.jpg"
                  alt="Capture authentique d'OCRBookor : Éditeur Bi-Fenêtre avec scan de Buffon et reconnaissance Tesseract"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-stone-950/80 backdrop-blur-xs border border-stone-800 text-[11px] text-stone-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Écran 4 : Éditeur Bi-Fenêtre Synchronisé</span>
                    <span className="text-stone-400">Scan historique vs texte océrisé avec indices de certitude</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono text-[10px] border border-emerald-700">
                    Confiance 98.7%
                  </span>
                </div>
              </div>

              {/* Note de véracité documentaire */}
              <p className="mt-2 text-center text-[11px] text-stone-600 dark:text-stone-300 italic">
                Capture réelle du logiciel en situation de relecture sur une édition de 1778.
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
              Le constat documentaire
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              Pourquoi un PDF scanné ne suffit pas
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              La numérisation brute d’un ouvrage produit le plus souvent un fichier PDF contenant uniquement des photographies de pages. Sans traitement adapté, ces documents posent des limites majeures.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Texte inerte &amp; recherche impossible
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Le texte ne peut pas être sélectionné, copié ou indexé. Les synthèses vocales et liseuses électroniques ne peuvent pas le lire, et les moteurs de recherche restent aveugles face aux images brutes.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Défauts physiques &amp; inclinaison
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Les pages scannées souffrent souvent d'inclinaison (*skew*), de courbure de reliure, de taches d'encre ou d'un contraste affaibli par le jaunissement du papier d'époque.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Césures brisées &amp; typographie dégradée
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Une extraction brute découpe les mots en fin de ligne (ex. « dé- » / « veloppement ») et ignore les règles typographiques françaises (espaces insécables devant la ponctuation double, guillemets cadratins, ligatures).
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                La réponse d'OCRBookor
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                OCRBookor applique un pipeline rigoureux : analyse de la résolution DPI, redressement automatique, binarisation Otsu, détection des césures, correction bi-fenêtre et structuration en EPUB 3 et Markdown.
              </p>
            </div>

          </div>

          {/* Avertissement transparent sur les limites */}
          <div className="mt-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">Périmètre technique vérifié : </span>
              OCRBookor est optimisé pour les <strong>textes imprimés</strong> (caractères au plomb ou impression moderne). Il ne prend pas en charge les écritures manuscrites cursives ni les formules mathématiques complexes. La qualité du texte final dépend de la résolution du scan source et requiert une étape de vérification humaine que le logiciel facilite grâce à son éditeur bi-fenêtre.
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
              Méthodologie Documentaire
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              Comment fonctionne OCRBookor ?
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Un pipeline complet articulé autour de 5 étapes vérifiables dans le code source de l’application.
            </p>
          </div>

          {/* Étapes du pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Étape 1 */}
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative space-y-2">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">01 / 05</span>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-stone-500" />
                Importer
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Glisser-déposer de livres scannés au format PDF. Détection du nombre de pages et analyse du flux d'images.
              </p>
            </div>

            {/* Étape 2 */}
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative space-y-2">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">02 / 05</span>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-stone-500" />
                Analyser
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Calcul de la résolution réelle (DPI), redressement d'angle (Deskew) et binarisation adaptative par méthode d'Otsu.
              </p>
            </div>

            {/* Étape 3 */}
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative space-y-2">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">03 / 05</span>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-stone-500" />
                Reconnaître
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Moteur Tesseract v5 en WebAssembly ou CLI. Calcul de la confiance au mot près et extraction des coordonnées spatiales.
              </p>
            </div>

            {/* Étape 4 */}
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative space-y-2">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">04 / 05</span>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-stone-500" />
                Reconstruire
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Recollage des césures de bout de ligne, règles typographiques françaises (espaces insécables, guillemets, ligatures).
              </p>
            </div>

            {/* Étape 5 */}
            <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative space-y-2">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">05 / 05</span>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-stone-500" />
                Exporter
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Génération d'EPUB 3 conforme W3C/IDPF, Markdown avec métadonnées Dublin Core, HTML5 autonome et texte brut UTF-8.
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
              Capacités Vérifiées
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              Une suite logicielle complète &amp; spécialisée
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Toutes les fonctionnalités ci-dessous sont implémentées et testées dans le dépôt officiel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* F1 : Hors-ligne */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                100% Souverain &amp; Hors-Ligne
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Aucun document n'est transmis à un serveur distant. Vos livres, archives privées ou documents patrimoniaux restent strictement sur votre machine.
              </p>
            </div>

            {/* F2 : Éditeur bi-fenêtre */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Éditeur Bi-Fenêtre Synchronisé
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Le scan haute résolution avec zoom et calque de coordonnées à gauche fait face au texte éditable à droite, avec surlignage des mots à faible confiance.
              </p>
            </div>

            {/* F3 : Typographie française */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Type className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Normes Imprimerie Nationale
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Application automatique des espaces insécables devant <code>! ? ; : % €</code>, des guillemets français <code>« »</code> et des ligatures <code>œ</code> et <code>æ</code>.
              </p>
            </div>

            {/* F4 : Dé-césure */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Dé-césure Intelligente
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Ressoude les mots coupés en fin de ligne tout en préservant les mots composés légitimes grâce à un dictionnaire lexical de contrôle.
              </p>
            </div>

            {/* F5 : Extraction gravures */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                <Maximize2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Gravures &amp; Illustrations
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Extraction des planches et illustrations avec gestionnaire de légendes et intégration propre dans le livre numérique final.
              </p>
            </div>

            {/* F6 : Métadonnées Dublin Core */}
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                <BookMarked className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Structure &amp; Dublin Core
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Organisation en chapitres (H1, H2, H3) et saisie des métadonnées normalisées (Titre, Auteur, Année, Identifiant UUID, Éditeur).
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
              Diffusion &amp; Archivage
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              Les documents obtenus avec OCRBookor
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Des livrables standardisés, prêts pour la lecture sur liseuse, l'édition dans Obsidian ou l'indexation de recherche.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Format 1 : EPUB 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border-2 border-amber-600/30 dark:border-amber-500/30 shadow-md space-y-3 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase">
                Recommandé
              </div>
              <FileCheck className="w-8 h-8 text-amber-700 dark:text-amber-400" />
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                EPUB 3.3 Strict
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Archive conforme IDPF avec <code>mimetype</code> non compressé, <code>content.opf</code>, navigation <code>nav.xhtml</code> et feuille de style typographique. Compatible Kobo, Tolino, Calibre et Apple Books.
              </p>
            </div>

            {/* Format 2 : Markdown */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <FileCode className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Markdown (.md)
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Fichier textuel enrichi d’un frontmatter YAML Dublin Core. Idéal pour intégration dans Obsidian, Logseq, Zotero, Notion ou un dépôt Git.
              </p>
            </div>

            {/* Format 3 : HTML 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <Globe className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                HTML 5 Autonome
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Page web autonome auto-suffisante avec mise en page responsive, polices à empattements et styles typographiques pour consultation immédiate.
              </p>
            </div>

            {/* Format 4 : Texte brut */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <FileText className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Texte Brut UTF-8 (.txt)
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Encodage UTF-8 universel avec paragraphes régularisés, idéal pour l'analyse lexicale, les modèles de langage ou l'archivage pérenne.
              </p>
            </div>

          </div>

          <div className="mt-8 text-center text-xs text-stone-600 dark:text-stone-300">
            * OCRBookor produit également un fichier <strong>book.json</strong> pour sauvegarder l'intégralité du projet (coordonnées des mots, calques OCR et corrections) pour reprise ultérieure.
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
              Cas d’Usage Réels
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              À qui s’adresse OCRBookor ?
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Une conception pensée pour les professionnels et passionnés du texte écrit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Chercheurs &amp; Historiens
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Traitement de sources primaires numérisées, archives et traités anciens avec extraction plein texte vérifiable et citation facilitée dans les travaux académiques.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Bibliophiles &amp; Collectionneurs
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Transformation de scans d'ouvrages rares ou épuisés du domaine public en livres numériques confortables à lire sur liseuse électronique.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                Archivistes &amp; Documentalistes
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Numérisation et océrisation souveraine sans abonnement cloud, sans dépendance réseau et avec préservation des métadonnées bibliographiques.
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
              Engagements &amp; Rigueur
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              Pourquoi choisir OCRBookor ?
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Une suite documentaire construite sur des bases techniques éprouvées et transparentes.
            </p>
          </div>

          <div className="space-y-4">
            
            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Indépendance totale vis-à-vis des services cloud
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Tous les calculs (redressement, seuillage, OCR, dé-césure, export) s'exécutent sur votre propre matériel. Aucune création de compte, aucun quota de pages, aucun coût d'API.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Respect des règles d'édition françaises
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Contrairement aux outils OCR génériques internationaux, OCRBookor intègre les finesses de la typographie française pour éviter les lignes orphelines et les signes de ponctuation mal placés.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Transparence scientifique des métriques
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  Le logiciel refuse d'inventer des taux de précision fictifs : les métriques CER (Character Error Rate) et WER (Word Error Rate) ne sont calculées que si vous fournissez une transcription de référence certifiée.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Code ouvert &amp; suite de tests automatisée
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  20 tests unitaires et d'intégration bout-en-bout valident l'arborescence des fichiers EPUB, la fidélité des distances de Levenshtein et l'intégrité de la base de données SQLite locale.
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
              Aperçu en situation
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              L'interface d'OCRBookor en action
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Découvrez l'écran de correction bi-fenêtre sur le corpus de test réel « Buffon — L'Histoire Naturelle (1778) ».
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-stone-300 dark:border-stone-800 shadow-2xl bg-stone-900">
            <img
              src="/docs/images/screenshot.jpg"
              alt="Capture d'écran authentique de l'interface d'OCRBookor"
              className="w-full h-auto"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">Navigation par page &amp; laser OCR</span>
              <p className="text-stone-600 dark:text-stone-400">
                La ligne lumineuse indique la ligne en cours de traitement pendant l'océrisation et facilite le repérage visuel lors de la relecture.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">Indices de confiance colorés</span>
              <p className="text-stone-600 dark:text-stone-400">
                Chaque mot incertain est surligné (vert &gt;90%, orange 60-90%, rouge &lt;60%) pour cibler immédiatement les zones à vérifier.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">Palette de caractères spéciaux</span>
              <p className="text-stone-600 dark:text-stone-400">
                Boutons d'insertion rapide pour les caractères rares ou accentués : <code>à è î ô ù ç œ æ</code>.
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
              Distribution &amp; Binaires
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              Commencez à transformer vos livres scannés
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Installez OCRBookor en une seule ligne de commande ou téléchargez directement le paquet Debian officiel.
            </p>
          </div>

          {/* Méthode Express Recommandée : 1 ligne via curl */}
          <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-linear-to-br from-amber-900/10 via-amber-800/5 to-transparent border-2 border-amber-600/80 dark:border-amber-500 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-700 text-white tracking-wider">
                  Méthode Express Recommandée
                </span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Installation directe via curl (toujours à jour)
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-mono">Debian 12/13, Ubuntu 22.04/24.04, Linux Mint</span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 mb-3 leading-relaxed">
              Cette commande télécharge automatiquement la dernière version du binaire, l'installe proprement avec <code>dpkg</code>, résout toutes les dépendances et configure l'exécutable <code>/usr/bin/ocrbookor</code> :
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
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-300" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Aucun téléchargement manuel</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Résolution automatique des dépendances</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Exécutable <code>/usr/bin/ocrbookor</code> prêt</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Carte Linux Desktop .deb */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Téléchargement Manuel (.deb)
                </span>
                <span className="text-xs font-mono text-stone-600 dark:text-stone-300">v1.2.0 • 2.1 Mo</span>
              </div>

              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                Paquet Linux Debian / Ubuntu (.deb)
              </h3>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Compatible Debian 12/13, Ubuntu 22.04/24.04 LTS, Linux Mint. Installe le lanceur <code>/usr/bin/ocrbookor</code> et le raccourci dans le menu des applications.
              </p>

              <div className="p-3 bg-stone-900 text-stone-200 rounded-lg text-xs font-mono space-y-1">
                <div className="text-stone-500"># Téléchargement &amp; installation</div>
                <div>sudo dpkg -i ocrbookor_1.2.0_amd64.deb</div>
                <div>sudo apt-get install -f</div>
                <div>ocrbookor</div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://github.com/nouhailler/OCRBookor/releases/tag/v1.2.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-amber-700 text-white hover:bg-amber-800 transition"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le .deb sur GitHub Releases
                </a>

                <a
                  href="https://github.com/nouhailler/OCRBookor/raw/main/releases/ocrbookor_1.2.0_amd64.deb"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  Lien direct binaire
                </a>
              </div>
            </div>

            {/* Carte Dépôt Source & Web */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  Code Source Libre
                </span>
                <span className="text-xs font-mono text-stone-600 dark:text-stone-300">Apache 2.0 / MIT</span>
              </div>

              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                Dépôt GitHub &amp; Version Web
              </h3>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Clonez le dépôt pour exécuter l'application localement dans Node.js ou explorez la suite de tests automatisée.
              </p>

              <div className="p-3 bg-stone-900 text-stone-200 rounded-lg text-xs font-mono space-y-1">
                <div className="text-stone-500"># Cloner et lancer localement</div>
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
                  Consulter le dépôt GitHub
                </a>

                <button
                  onClick={onLaunchApp}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
                >
                  Tester dans le navigateur
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
              Foire Aux Questions
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-950 dark:text-white">
              Questions fréquentes
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Des réponses claires et sans promesse abusive, fondées sur les capacités réelles du logiciel.
            </p>
          </div>

          <div className="space-y-3">
            
            {/* Q1 */}
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 focus:outline-hidden"
              >
                <span>Qu'est-ce qu'OCRBookor exactement ?</span>
                {openFaq === 0 ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === 0 && (
                <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                  OCRBookor est une suite logicielle documentaire autonome permettant d'importer des livres numérisés au format PDF, de les prétraiter (calcul DPI, redressement, binarisation Otsu), de reconnaître leur texte via le moteur Tesseract v5 (100% hors-ligne), de réconcilier les coquilles et césures dans un éditeur bi-fenêtre et de produire des livres numériques au format standard EPUB 3, Markdown, HTML et TXT.
                </div>
              )}
            </div>

            {/* Q2 */}
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 focus:outline-hidden"
              >
                <span>Mes livres et documents sont-ils envoyés sur internet ?</span>
                {openFaq === 1 ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === 1 && (
                <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                  <strong>Non, jamais.</strong> OCRBookor fonctionne de manière 100% locale et hors-ligne. Le traitement de l'image, la reconnaissance optique et la génération des fichiers EPUB sont exécutés directement sur votre processeur local (via WebAssembly dans l'application web ou nativement via le paquet Linux).
                </div>
              )}
            </div>

            {/* Q3 */}
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 focus:outline-hidden"
              >
                <span>Le logiciel peut-il reconnaître l'écriture manuscrite ?</span>
                {openFaq === 2 ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === 2 && (
                <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                  <strong>Non.</strong> OCRBookor v1.2.0 est conçu pour les textes imprimés (typographie au plomb ancienne ou impressions modernes). La reconnaissance de manuscrits, de partitions musicales ou de formules mathématiques complexes n'est pas prise en charge dans cette version.
                </div>
              )}
            </div>

            {/* Q4 */}
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 focus:outline-hidden"
              >
                <span>Comment installer la landing page comme Progressive Web App (PWA) ?</span>
                {openFaq === 3 ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === 3 && (
                <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                  Cliquez sur le bouton <strong>« Installer la PWA »</strong> présent dans la barre supérieure (sur Chrome, Edge ou Android). Sur iOS (iPhone/iPad), touchez le bouton de partage de Safari puis « Sur l'écran d'accueil ». La landing page sera alors accessible même sans connexion internet grâce au Service Worker dédié.
                </div>
              )}
            </div>

            {/* Q5 */}
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <button
                onClick={() => toggleFaq(4)}
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 focus:outline-hidden"
              >
                <span>Faut-il nécessairement relire le texte après l'OCR ?</span>
                {openFaq === 4 ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
              </button>
              {openFaq === 4 && (
                <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                  <strong>Oui, pour un document de qualité éditoriale.</strong> Même si l'OCR atteint plus de 98% de confiance sur un scan propre, des anomalies ponctuelles (lettres anciennes comme le « s » long confondu avec un « f », taches d'encre) peuvent survenir. L'éditeur bi-fenêtre d'OCRBookor est spécifiquement pensé pour rendre cette relecture rapide et fluide.
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
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">v1.2.0</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-md">
                Suite logicielle locale et souveraine dédiée à la numérisation, à la reconnaissance optique de caractères (OCR) et à la reconstruction éditoriale de livres scannés au standard EPUB 3 et Markdown.
              </p>
              <div className="text-[11px] text-stone-500">
                Auteur &amp; Maintenance : Patrick Nouhailler
              </div>
            </div>

            {/* Col 2 : Liens du projet */}
            <div className="space-y-2">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-200">
                Ressources Officielles
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-400">
                <li>
                  <a
                    href="https://github.com/nouhailler/OCRBookor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1"
                  >
                    Dépôt GitHub principal <ExternalLink className="w-3 h-3 text-stone-600" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/nouhailler/OCRBookor/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1"
                  >
                    Releases &amp; Binaires .deb <ExternalLink className="w-3 h-3 text-stone-600" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/nouhailler/OCRBookor/blob/main/USER_GUIDE.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1"
                  >
                    Manuel Utilisateur (USER_GUIDE) <ExternalLink className="w-3 h-3 text-stone-600" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/nouhailler/OCRBookor/blob/main/ARCHITECTURE.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-400 transition flex items-center gap-1"
                  >
                    Architecture Technique <ExternalLink className="w-3 h-3 text-stone-600" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3 : Déploiement & Format */}
            <div className="space-y-2">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-stone-200">
                Hébergement &amp; PWA
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Cette landing page est conçue pour être hébergée statiquement sur <strong>Cloudflare Pages</strong> et installable en <strong>PWA</strong> via un Service Worker local.
              </p>
              <div className="pt-2">
                <button
                  onClick={onLaunchApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 text-stone-200 hover:bg-stone-700 transition"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  Accéder à l'application OCRBookor
                </button>
              </div>
            </div>

          </div>

          {/* Décharge légale & Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
            <div>
              © 2026 OCRBookor — Logiciel libre sous licence Apache 2.0. Décharge légale : L'auteur décline toute responsabilité quant aux contenus et données importés par les utilisateurs.
            </div>
            <div className="flex items-center gap-4 text-stone-400">
              <a href="#hero" className="hover:text-stone-200 transition">Haut de page ↑</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
