import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'landing');
const outputDir = path.join(rootDir, 'dist-landing');

console.log('=================================================================');
console.log('  OCRBookor - Fabrication du Bundle Cloudflare Pages (Landing)');
console.log('=================================================================');
console.log(`Source  : ${sourceDir}`);
console.log(`Sortie  : ${outputDir}`);

// 1. Nettoyage et création du dossier de sortie
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// 2. Copie récursive de tous les fichiers du dossier landing/
function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(sourceDir, outputDir);

// 3. Vérification des fichiers clés pour Cloudflare Pages & PWA
const requiredFiles = [
  'index.html',
  'en.html',
  'en/index.html',
  'manifest.webmanifest',
  'sw.js',
  '_headers',
  '_redirects',
  'logo.svg',
  'icons/pwa-192x192.png',
  'icons/pwa-512x512.png',
  'icons/apple-touch-icon.png',
  'images/screenshot.jpg'
];

let allOk = true;
for (const relPath of requiredFiles) {
  const fullPath = path.join(outputDir, relPath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✓ [OK] ${relPath} (${stats.size} octets)`);
  } else {
    console.error(`❌ [MANQUANT] ${relPath}`);
    allOk = false;
  }
}

if (!allOk) {
  console.error('\n⚠️ Des fichiers indispensables sont manquants dans le bundle.');
  process.exit(1);
}

console.log('\n=================================================================');
console.log('  ✓ SUCCÈS : Bundle Cloudflare Pages généré avec succès !');
console.log(`  Dossier prêt à déployer : ${outputDir}`);
console.log('=================================================================\n');
