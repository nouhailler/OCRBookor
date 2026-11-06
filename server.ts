/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { execFile, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Cross-platform data directory resolution
function resolveDataDir(): string {
  if (process.env.OCRBOOKOR_DATA_DIR) {
    return path.resolve(process.env.OCRBOOKOR_DATA_DIR);
  }
  if (process.platform === 'win32') {
    const base =
      process.env.LOCALAPPDATA ||
      process.env.APPDATA ||
      path.join(process.env.USERPROFILE || 'C:\\', 'AppData', 'Local');
    return path.join(base, 'OCRBookor');
  }
  const home = process.env.HOME || process.env.USERPROFILE || '.';
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'OCRBookor');
  }
  return path.join(home, '.local', 'share', 'ocrbookor');
}

const DATA_DIR = resolveDataDir();
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

for (const dir of [DATA_DIR, PROJECTS_DIR, UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Multer storage for uploaded PDFs
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250 MB
});

// Detect application root where backend/ is located
const candidateAppRoots = [
  process.env.OCRBOOKOR_APP_ROOT,
  fs.existsSync(path.join(__dirname, 'backend')) ? __dirname : null,
  fs.existsSync(path.join(process.cwd(), 'backend')) ? process.cwd() : null,
  fs.existsSync('/opt/ocrbookor/backend') ? '/opt/ocrbookor' : null,
].filter(Boolean) as string[];
const APP_ROOT = candidateAppRoots[0] || process.cwd();

/**
 * Robust Cross-Platform Python CLI detection (Windows / Linux / macOS)
 */
interface PythonCommand {
  bin: string;
  prefixArgs: string[];
}

let cachedPythonCommand: PythonCommand | null = null;

function resolvePythonCommand(): PythonCommand {
  if (cachedPythonCommand) {
    return cachedPythonCommand;
  }

  // 1. Explicit environment variable override
  const envBin = process.env.PYTHON_BIN || process.env.OCRBOOKOR_PYTHON;
  if (envBin) {
    cachedPythonCommand = { bin: envBin, prefixArgs: [] };
    return cachedPythonCommand;
  }

  const isWin = process.platform === 'win32';
  const candidates: Array<{ bin: string; prefixArgs: string[] }> = [];

  if (isWin) {
    // 1. Python in PATH
    candidates.push({ bin: 'python', prefixArgs: [] });
    // 2. Python Launcher on Windows (py -3)
    candidates.push({ bin: 'py', prefixArgs: ['-3'] });
    // 3. python3 alias
    candidates.push({ bin: 'python3', prefixArgs: [] });

    // 4. Bundled Python or Virtual Environments in app root
    candidates.push({ bin: path.join(APP_ROOT, 'python', 'python.exe'), prefixArgs: [] });
    candidates.push({ bin: path.join(APP_ROOT, 'venv', 'Scripts', 'python.exe'), prefixArgs: [] });

    // 5. Standard Windows installation paths
    const localApp = process.env.LOCALAPPDATA || '';
    const userProf = process.env.USERPROFILE || '';
    const winPaths = [
      path.join(localApp, 'Programs', 'Python', 'Python312', 'python.exe'),
      path.join(localApp, 'Programs', 'Python', 'Python311', 'python.exe'),
      path.join(localApp, 'Programs', 'Python', 'Python310', 'python.exe'),
      path.join(userProf, 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'python.exe'),
      path.join(userProf, 'AppData', 'Local', 'Programs', 'Python', 'Python311', 'python.exe'),
      path.join(userProf, 'AppData', 'Local', 'Programs', 'Python', 'Python310', 'python.exe'),
      'C:\\Python312\\python.exe',
      'C:\\Python311\\python.exe',
      'C:\\Python310\\python.exe',
    ];
    for (const p of winPaths) {
      if (fs.existsSync(p)) {
        candidates.push({ bin: p, prefixArgs: [] });
      }
    }
  } else {
    candidates.push({ bin: 'python3', prefixArgs: [] });
    candidates.push({ bin: 'python', prefixArgs: [] });
    // macOS Apple Silicon (M1/M2/M3/M4) Homebrew
    candidates.push({ bin: '/opt/homebrew/bin/python3', prefixArgs: [] });
    // macOS Intel Homebrew & Linux local
    candidates.push({ bin: '/usr/local/bin/python3', prefixArgs: [] });
    // Standard system path
    candidates.push({ bin: '/usr/bin/python3', prefixArgs: [] });
    // Pyenv
    const home = process.env.HOME || '.';
    candidates.push({ bin: path.join(home, '.pyenv', 'shims', 'python3'), prefixArgs: [] });
  }

  // Probe candidates with a quick --version check
  for (const candidate of candidates) {
    try {
      const res = spawnSync(candidate.bin, [...candidate.prefixArgs, '--version'], {
        encoding: 'utf-8',
        timeout: 3000,
        windowsHide: true,
      });
      if (res.status === 0 && !res.error) {
        cachedPythonCommand = candidate;
        console.log(`[OCRBookor] Backend Python detecté : ${candidate.bin} ${candidate.prefixArgs.join(' ')}`);
        return candidate;
      }
    } catch {
      // Continue search
    }
  }

  // Fallback default
  cachedPythonCommand = isWin ? { bin: 'python', prefixArgs: [] } : { bin: 'python3', prefixArgs: [] };
  return cachedPythonCommand;
}

/**
 * Execute Python CLI command helper
 */
function runPythonCli(args: string[]): Promise<any> {
  const pyCmd = resolvePythonCommand();
  const fullArgs = [...pyCmd.prefixArgs, '-m', 'backend.api.cli', ...args];

  return new Promise((resolve, reject) => {
    execFile(
      pyCmd.bin,
      fullArgs,
      {
        cwd: APP_ROOT,
        maxBuffer: 10 * 1024 * 1024,
        env: {
          ...process.env,
          OCRBOOKOR_DATA_DIR: DATA_DIR,
          PYTHONIOENCODING: 'utf-8',
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Python CLI error: ${stderr || error.message}`);
          return reject(new Error(stderr || error.message));
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch {
          resolve({ raw: stdout.trim() });
        }
      }
    );
  });
}

// Initialize SQLite database at startup
runPythonCli(['init-db']).catch((err) => {
  console.warn('Database initialization warning:', err.message);
});

// ==========================================
// API REST Endpoints
// ==========================================

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'OCRBookor',
    version: '1.0.0',
    mode: 'local_offline',
  });
});

// 2. OCR engines availability status
app.get('/api/system/ocr-engines', async (_req: Request, res: Response) => {
  try {
    const statuses = await runPythonCli(['system-engines']);
    res.json(statuses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Projects CRUD
app.get('/api/projects', async (_req: Request, res: Response) => {
  try {
    const data = await runPythonCli(['list-projects']);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const result = await runPythonCli(['save-project', JSON.stringify(req.body)]);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const project = await runPythonCli(['get-project', req.params.id]);
    res.json(project);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.put('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const payload = { ...req.body, id: req.params.id };
    const result = await runPythonCli(['save-project', JSON.stringify(payload)]);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const result = await runPythonCli(['delete-project', req.params.id]);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. PDF Upload & Ingestion
app.post('/api/projects/:id/upload-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    const projectId = req.params.id;
    const tempPath = req.file.path;
    const targetDir = path.join(PROJECTS_DIR, projectId, 'source');
    fs.mkdirSync(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, 'original.pdf');

    // Verify magic bytes: must start with %PDF
    const buffer = Buffer.alloc(5);
    const fd = fs.openSync(tempPath, 'r');
    fs.readSync(fd, buffer, 0, 5, 0);
    fs.closeSync(fd);

    if (buffer.toString('utf-8', 0, 4) !== '%PDF') {
      fs.unlinkSync(tempPath);
      return res.status(400).json({ error: 'Fichier invalide : signature %PDF absente' });
    }

    fs.copyFileSync(tempPath, targetPath);
    fs.unlinkSync(tempPath);

    const stats = fs.statSync(targetPath);

    // Update project source file in db
    await runPythonCli(['save-project', JSON.stringify({
      id: projectId,
      sourceFileName: req.file.originalname,
      fileSizeBytes: stats.size,
      status: 'importe',
    })]);

    res.json({
      fileName: req.file.originalname,
      sizeBytes: stats.size,
      pagesCount: 1, // updated dynamically after extraction
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Page text correction
app.put('/api/projects/:id/pages/:page/text', async (req: Request, res: Response) => {
  try {
    const { correctedText } = req.body;
    if (typeof correctedText !== 'string') {
      return res.status(400).json({ error: 'Texte corrigé manquant' });
    }
    const result = await runPythonCli(['save-page-text', req.params.id, req.params.page, correctedText]);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Export document
app.post('/api/projects/:id/export/:format', async (req: Request, res: Response) => {
  try {
    const format = req.params.format;
    const result = await runPythonCli(['export', req.params.id, format]);

    res.json({
      fileName: result.file_name,
      fileSizeBytes: result.size_bytes,
      downloadUrl: `/api/projects/${req.params.id}/exports/${result.file_name}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Download exported file
app.get('/api/projects/:id/exports/:filename', (req: Request, res: Response) => {
  const filePath = path.join(PROJECTS_DIR, req.params.id, 'exports', req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Fichier introuvable');
  }
  res.download(filePath, req.params.filename);
});

// 8. Stream source PDF
app.get('/api/projects/:id/source/pdf', (req: Request, res: Response) => {
  const filePath = path.join(PROJECTS_DIR, req.params.id, 'source', 'original.pdf');
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('PDF source introuvable');
  }
  res.sendFile(filePath);
});

// 9. Download release package assets (.deb, .exe, .zip, .txt)
app.get('/releases/:filename', (req: Request, res: Response) => {
  const releasesDir = path.resolve('releases');
  const sanitizedFilename = path.basename(req.params.filename);
  const filePath = path.join(releasesDir, sanitizedFilename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Paquet release introuvable');
  }
  res.download(filePath, sanitizedFilename);
});

// ==========================================
// Vite Middleware / Static Serving
// ==========================================
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const candidateDirs = [
      path.resolve('dist'),
      path.join(__dirname, 'dist'),
      path.join(APP_ROOT, 'dist'),
      '/opt/ocrbookor/dist',
    ];
    const distPath = candidateDirs.find((d) => fs.existsSync(path.join(d, 'index.html'))) || path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OCRBookor Server v1.4.0] Running on http://0.0.0.0:${PORT} (platform: ${process.platform}, mode: ${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer().catch((err) => {
  console.error('[OCRBookor Server] Fatal startup error:', err);
  process.exit(1);
});
