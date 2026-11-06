#!/usr/bin/env node
/**
 * OCRBookor - Script de Fabrication du Paquet Windows (Portable Zip & Staging Installer)
 * Version: 1.3.0
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
const WIN_DIST_DIR_NAME = `ocrbookor_${VERSION}_win_x64`;
const WIN_DIST_DIR = path.join(rootDir, 'releases', WIN_DIST_DIR_NAME);
const WIN_ZIP_PATH = path.join(rootDir, 'releases', `${WIN_DIST_DIR_NAME}.zip`);
const SHA_FILE = path.join(rootDir, 'releases', 'SHA256SUMS.txt');

console.log('=================================================================');
console.log(`  Construction du Paquet Windows Desktop pour OCRBookor v${VERSION}`);
console.log('=================================================================');

// 0. Vérification et installation conditionnelle des dépendances natives selon la plateforme
console.log('→ 0/5 Vérification des dépendances natives de la plateforme...');
installPlatformDependencies();

// 1. Compilation du frontend si absent
if (!fs.existsSync(path.join(rootDir, 'dist', 'index.html'))) {
  console.log('→ 1/5 Compilation du frontend (Vite build)...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
} else {
  console.log('✓ 1/5 Frontend déjà compilé dans dist/');
}

// 2. Compilation du serveur Node.js autonome si absent
console.log('→ 2/5 Compilation de server.js autonome...');
execSync(
  `npx esbuild server.ts --bundle --platform=node --target=node18 --format=esm --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);" --outfile="${path.join(rootDir, 'server.js')}" --external:vite`,
  { cwd: rootDir, stdio: 'inherit' }
);

// 3. Préparation du dossier de distribution Windows
console.log(`→ 3/5 Préparation du dossier : ${WIN_DIST_DIR}...`);
if (fs.existsSync(WIN_DIST_DIR)) {
  fs.rmSync(WIN_DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(WIN_DIST_DIR, { recursive: true });

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    // Ignore pycache, node_modules, temp data
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
fs.mkdirSync(path.join(WIN_DIST_DIR, 'dist'), { recursive: true });
copyRecursive(path.join(rootDir, 'dist'), path.join(WIN_DIST_DIR, 'dist'));

console.log('  - Copie de backend/...');
fs.mkdirSync(path.join(WIN_DIST_DIR, 'backend'), { recursive: true });
copyRecursive(path.join(rootDir, 'backend'), path.join(WIN_DIST_DIR, 'backend'));

console.log('  - Copie des fichiers racines et scripts Windows...');
fs.copyFileSync(path.join(rootDir, 'server.js'), path.join(WIN_DIST_DIR, 'server.js'));
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(WIN_DIST_DIR, 'package.json'));
fs.copyFileSync(path.join(rootDir, 'requirements.txt'), path.join(WIN_DIST_DIR, 'requirements.txt'));

if (fs.existsSync(path.join(rootDir, 'LICENSE'))) {
  fs.copyFileSync(path.join(rootDir, 'LICENSE'), path.join(WIN_DIST_DIR, 'LICENSE'));
}
if (fs.existsSync(path.join(rootDir, 'README.md'))) {
  fs.copyFileSync(path.join(rootDir, 'README.md'), path.join(WIN_DIST_DIR, 'README.md'));
}
if (fs.existsSync(path.join(rootDir, 'README.en.md'))) {
  fs.copyFileSync(path.join(rootDir, 'README.en.md'), path.join(WIN_DIST_DIR, 'README.en.md'));
}

// Copie des fichiers de démarrage Windows
fs.copyFileSync(
  path.join(rootDir, 'scripts', 'windows', 'ocrbookor.cmd'),
  path.join(WIN_DIST_DIR, 'ocrbookor.cmd')
);
fs.copyFileSync(
  path.join(rootDir, 'scripts', 'windows', 'install-dependencies.cmd'),
  path.join(WIN_DIST_DIR, 'install-dependencies.cmd')
);

// README rapide pour les utilisateurs Windows dans l'archive
const quickStartTxt = `=================================================================
  OCRBookor v${VERSION} pour Windows (Edition Portable)
=================================================================

PREREQUIS :
1. Node.js (version 18 ou superieure) : https://nodejs.org
2. Python (version 3.10 ou superieure) : https://www.python.org
   -> Cochez "Add python.exe to PATH" lors de l'installation de Python.

DEMARRAGE RAPIDE :
1. (Premiere utilisation) Double-cliquez sur "install-dependencies.cmd"
   pour installer les modules Python (PyMuPDF, RapidOCR, Tesseract...).
2. Double-cliquez sur "ocrbookor.cmd".
3. Votre navigateur par defaut s'ouvrira sur http://localhost:3000.

Documentation et support : https://github.com/nouhailler/OCRBookor
`;
fs.writeFileSync(path.join(WIN_DIST_DIR, 'README_WINDOWS.txt'), quickStartTxt, 'utf-8');

// 4. Génération de l'archive ZIP portable via JSZip
console.log(`→ 4/5 Compression de l'archive ZIP : ${WIN_ZIP_PATH}...`);
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
      zipFolder.file(item.name, data);
    }
  }
}

addFolderToZip(WIN_DIST_DIR, zip);

const zipBuffer = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
});

fs.writeFileSync(WIN_ZIP_PATH, zipBuffer);
const zipStats = fs.statSync(WIN_ZIP_PATH);
const zipSizeMb = (zipStats.size / (1024 * 1024)).toFixed(2);
console.log(`✓ Archive ZIP créée avec succès (${zipSizeMb} Mo)`);

// 5. Calcul de l'empreinte SHA256 et mise à jour de SHA256SUMS.txt
console.log('→ 5/5 Calcul du hash SHA256...');
const fileBuffer = fs.readFileSync(WIN_ZIP_PATH);
const hashSum = crypto.createHash('sha256');
hashSum.update(fileBuffer);
const hexHash = hashSum.digest('hex');
const zipFileName = path.basename(WIN_ZIP_PATH);

console.log(`  SHA256: ${hexHash}  ${zipFileName}`);

// Mettre à jour SHA256SUMS.txt
let shaContent = '';
if (fs.existsSync(SHA_FILE)) {
  shaContent = fs.readFileSync(SHA_FILE, 'utf-8');
}
const lines = shaContent.split('\n').filter((l) => l.trim() && !l.includes(zipFileName));
lines.push(`${hexHash}  ${zipFileName}`);
fs.writeFileSync(SHA_FILE, lines.join('\n') + '\n', 'utf-8');

console.log('\n=================================================================');
console.log('✓ SUCCÈS : Bundle Windows prêt pour déploiement et Inno Setup !');
console.log(`  - Dossier : ${WIN_DIST_DIR}`);
console.log(`  - Archive : ${WIN_ZIP_PATH}`);
console.log(`  - SHA256 :  ${hexHash}`);
console.log('=================================================================\n');
