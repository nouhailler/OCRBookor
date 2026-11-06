#!/usr/bin/env node
/**
 * OCRBookor - Script de Fabrication du Paquet macOS Universal
 * Version: 1.4.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import { installPlatformDependencies } from './install-platform-deps.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const VERSION = '1.4.0';
const MAC_DIST_DIR_NAME = `ocrbookor_${VERSION}_macos_universal`;
const MAC_DIST_DIR = path.join(rootDir, 'releases', MAC_DIST_DIR_NAME);
const MAC_ZIP_PATH = path.join(rootDir, 'releases', `${MAC_DIST_DIR_NAME}.zip`);
const MAC_TAR_PATH = path.join(rootDir, 'releases', `${MAC_DIST_DIR_NAME}.tar.gz`);
const SHA_FILE = path.join(rootDir, 'releases', 'SHA256SUMS.txt');

console.log('=================================================================');
console.log(`  Construction du Paquet macOS Universal pour OCRBookor v${VERSION}`);
console.log('=================================================================');

// 0. Vérification et installation conditionnelle des dépendances natives selon la plateforme
console.log('→ 0/5 Vérification des dépendances natives...');
installPlatformDependencies();

// 1. Compilation du frontend si absent
if (!fs.existsSync(path.join(rootDir, 'dist', 'index.html'))) {
  console.log('→ 1/5 Compilation du frontend (Vite build)...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
} else {
  console.log('✓ 1/5 Frontend déjà compilé dans dist/');
}

// 2. Compilation de server.js autonome si absent
console.log('→ 2/5 Compilation de server.js autonome...');
execSync(
  `npx esbuild server.ts --bundle --platform=node --target=node18 --format=esm --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);" --outfile="${path.join(rootDir, 'server.js')}" --external:vite`,
  { cwd: rootDir, stdio: 'inherit' }
);

// 3. Préparation du dossier de distribution macOS
console.log(`→ 3/5 Préparation du dossier : ${MAC_DIST_DIR}...`);
if (fs.existsSync(MAC_DIST_DIR)) {
  fs.rmSync(MAC_DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(MAC_DIST_DIR, { recursive: true });

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '__pycache__' || entry.name === '.pytest_cache' || entry.name.endsWith('.pyc')) {
      continue;
    }
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

// Copie des répertoires et fichiers nécessaires
console.log('  - Copie de dist/...');
fs.mkdirSync(path.join(MAC_DIST_DIR, 'dist'), { recursive: true });
copyRecursive(path.join(rootDir, 'dist'), path.join(MAC_DIST_DIR, 'dist'));

console.log('  - Copie de backend/...');
fs.mkdirSync(path.join(MAC_DIST_DIR, 'backend'), { recursive: true });
copyRecursive(path.join(rootDir, 'backend'), path.join(MAC_DIST_DIR, 'backend'));

console.log('  - Copie des fichiers racines et lanceurs macOS...');
fs.copyFileSync(path.join(rootDir, 'server.js'), path.join(MAC_DIST_DIR, 'server.js'));
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(MAC_DIST_DIR, 'package.json'));
fs.copyFileSync(path.join(rootDir, 'requirements.txt'), path.join(MAC_DIST_DIR, 'requirements.txt'));

if (fs.existsSync(path.join(rootDir, 'LICENSE'))) {
  fs.copyFileSync(path.join(rootDir, 'LICENSE'), path.join(MAC_DIST_DIR, 'LICENSE'));
}
if (fs.existsSync(path.join(rootDir, 'README.md'))) {
  fs.copyFileSync(path.join(rootDir, 'README.md'), path.join(MAC_DIST_DIR, 'README.md'));
}
if (fs.existsSync(path.join(rootDir, 'README.en.md'))) {
  fs.copyFileSync(path.join(rootDir, 'README.en.md'), path.join(MAC_DIST_DIR, 'README.en.md'));
}

// Copie des scripts macOS
const cmdDest = path.join(MAC_DIST_DIR, 'ocrbookor.command');
const depDest = path.join(MAC_DIST_DIR, 'install-dependencies.sh');
fs.copyFileSync(path.join(rootDir, 'scripts', 'macos', 'ocrbookor.command'), cmdDest);
fs.copyFileSync(path.join(rootDir, 'scripts', 'macos', 'install-dependencies.sh'), depDest);

// Droits d'exécution
fs.chmodSync(cmdDest, 0o755);
fs.chmodSync(depDest, 0o755);

// Guide macOS inclus
const quickStartTxt = `=================================================================
  OCRBookor v${VERSION} pour macOS Desktop (Apple Silicon & Intel)
=================================================================

PRÉREQUIS :
1. Node.js (version 18 ou supérieure) : https://nodejs.org ou 'brew install node'
2. Python 3 (version 3.10 ou supérieure) : 'brew install python'
3. (Optionnel pour OCR hors-ligne) : 'brew install tesseract'

DÉMARRAGE RAPIDE :
1. Double-cliquez sur "ocrbookor.command" dans le Finder (ou lancez ./ocrbookor.command dans Terminal).
2. L'application s'ouvre automatiquement sur http://localhost:3000 dans votre navigateur par défaut.

Si macOS affiche un avertissement de sécurité lors du premier lancement :
  - Faites un Clic droit (ou Control + Clic) sur "ocrbookor.command"
  - Sélectionnez "Ouvrir" puis confirmez "Ouvrir".

Support & Documentation : https://github.com/nouhailler/OCRBookor
`;
fs.writeFileSync(path.join(MAC_DIST_DIR, 'README_MACOS.txt'), quickStartTxt, 'utf-8');

// 4. Compression ZIP & TAR.GZ
console.log(`→ 4/5 Compression des archives macOS...`);

// Archive TAR.GZ (préserve parfaitement les permissions Unix chmod 755)
try {
  execSync(`tar -czf "${MAC_TAR_PATH}" -C "${path.join(rootDir, 'releases')}" "${MAC_DIST_DIR_NAME}"`);
  const tarStats = fs.statSync(MAC_TAR_PATH);
  console.log(`✓ Archive TAR.GZ créée (${(tarStats.size / (1024 * 1024)).toFixed(2)} Mo)`);
} catch (e) {
  console.warn('⚠️ Échec de création tar.gz:', e.message);
}

// Archive ZIP
const zip = new JSZip();
function addFolderToZip(folderPath, zipFolder) {
  const items = fs.readdirSync(folderPath, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(folderPath, item.name);
    if (item.isDirectory()) {
      const subZip = zipFolder.folder(item.name);
      addFolderToZip(fullPath, subZip);
    } else {
      const data = fs.readFileSync(fullPath);
      zipFolder.file(item.name, data, {
        unixPermissions: item.name.endsWith('.command') || item.name.endsWith('.sh') ? '755' : '644'
      });
    }
  }
}
addFolderToZip(MAC_DIST_DIR, zip);

const zipBuffer = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
  platform: 'UNIX'
});
fs.writeFileSync(MAC_ZIP_PATH, zipBuffer);
const zipStats = fs.statSync(MAC_ZIP_PATH);
console.log(`✓ Archive ZIP créée (${(zipStats.size / (1024 * 1024)).toFixed(2)} Mo)`);

// 5. Calcul des hash SHA256
console.log('→ 5/5 Calcul des hash SHA256...');
function hashFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  return { name: path.basename(filePath), hash };
}

const hashes = [hashFile(MAC_ZIP_PATH), hashFile(MAC_TAR_PATH)].filter(Boolean);

let shaContent = fs.existsSync(SHA_FILE) ? fs.readFileSync(SHA_FILE, 'utf-8') : '';
let lines = shaContent.split('\n').filter((l) => l.trim());

for (const h of hashes) {
  lines = lines.filter((l) => !l.includes(h.name));
  lines.push(`${h.hash}  ${h.name}`);
  console.log(`  SHA256: ${h.hash}  ${h.name}`);
}
fs.writeFileSync(SHA_FILE, lines.join('\n') + '\n', 'utf-8');

console.log('\n=================================================================');
console.log('✓ SUCCÈS : Bundle macOS Universal prêt pour déploiement !');
console.log(`  - Dossier  : ${MAC_DIST_DIR}`);
console.log(`  - Archive  : ${MAC_ZIP_PATH}`);
console.log(`  - Archive  : ${MAC_TAR_PATH}`);
console.log('=================================================================\n');
