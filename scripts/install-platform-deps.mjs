#!/usr/bin/env node
/**
 * OCRBookor - Conditional Platform-Specific Native Dependencies Installer
 *
 * Resolves npm issue #4828 where cross-platform lockfiles (e.g. created on Linux)
 * fail to install optional platform-specific native binaries on Windows (e.g. Rolldown,
 * Tailwind Oxide, and esbuild).
 *
 * Runs automatically:
 * - During `npm install` (via package.json "postinstall")
 * - Before `npm run build` (via package.json "prebuild")
 * - In `scripts/build-windows.mjs`
 */

import { createRequire } from 'module';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

export function getMissingNativeDependencies(targetPlatform = process.platform, targetArch = process.arch) {
  const missing = [];
  const arch = targetArch === 'arm64' ? 'arm64' : (targetArch === 'ia32' ? 'ia32' : 'x64');

  // 1. Rolldown (used by Vite 8)
  try {
    const rolldownPkgPath = path.join(rootDir, 'node_modules', 'rolldown', 'package.json');
    if (fs.existsSync(rolldownPkgPath)) {
      const rolldownPkg = JSON.parse(fs.readFileSync(rolldownPkgPath, 'utf8'));
      const version = rolldownPkg.version;
      let bindingName = null;

      if (targetPlatform === 'win32') {
        bindingName = `@rolldown/binding-win32-${arch}-msvc`;
      } else if (targetPlatform === 'linux') {
        bindingName = `@rolldown/binding-linux-${arch}-gnu`;
      } else if (targetPlatform === 'darwin') {
        bindingName = `@rolldown/binding-darwin-${arch}`;
      }

      if (bindingName) {
        try {
          require.resolve(`${bindingName}/package.json`, { paths: [rootDir] });
        } catch {
          missing.push(`${bindingName}@${version}`);
        }
      }
    }
  } catch {
    // Ignore if rolldown not installed yet
  }

  // 2. @tailwindcss/oxide (used by Tailwind CSS v4)
  try {
    const oxidePkgPath = path.join(rootDir, 'node_modules', '@tailwindcss', 'oxide', 'package.json');
    if (fs.existsSync(oxidePkgPath)) {
      const oxidePkg = JSON.parse(fs.readFileSync(oxidePkgPath, 'utf8'));
      const version = oxidePkg.version;
      let bindingName = null;

      if (targetPlatform === 'win32') {
        bindingName = `@tailwindcss/oxide-win32-${arch}-msvc`;
      } else if (targetPlatform === 'linux') {
        bindingName = `@tailwindcss/oxide-linux-${arch}-gnu`;
      } else if (targetPlatform === 'darwin') {
        bindingName = `@tailwindcss/oxide-darwin-${arch}`;
      }

      if (bindingName) {
        try {
          require.resolve(`${bindingName}/package.json`, { paths: [rootDir] });
        } catch {
          missing.push(`${bindingName}@${version}`);
        }
      }
    }
  } catch {
    // Ignore if oxide not installed yet
  }

  // 3. esbuild (used for bundling server & scripts)
  try {
    const esbuildPkgPath = path.join(rootDir, 'node_modules', 'esbuild', 'package.json');
    if (fs.existsSync(esbuildPkgPath)) {
      const esbuildPkg = JSON.parse(fs.readFileSync(esbuildPkgPath, 'utf8'));
      const version = esbuildPkg.version;
      let bindingName = null;

      if (targetPlatform === 'win32') {
        bindingName = `@esbuild/win32-${arch}`;
      } else if (targetPlatform === 'linux') {
        bindingName = `@esbuild/linux-${arch}`;
      } else if (targetPlatform === 'darwin') {
        bindingName = `@esbuild/darwin-${arch}`;
      }

      if (bindingName) {
        try {
          require.resolve(`${bindingName}/package.json`, { paths: [rootDir] });
        } catch {
          missing.push(`${bindingName}@${version}`);
        }
      }
    }
  } catch {
    // Ignore if esbuild not installed yet
  }

  return missing;
}

export function installPlatformDependencies(options = {}) {
  const targetPlatform = options.platform || process.platform;
  const targetArch = options.arch || process.arch;

  const missing = getMissingNativeDependencies(targetPlatform, targetArch);

  if (missing.length === 0) {
    // No missing platform dependencies
    return;
  }

  console.log(`[Platform-Deps] Detected target platform: ${targetPlatform}-${targetArch}`);
  console.log(`[Platform-Deps] Missing platform-specific native dependencies: ${missing.join(', ')}`);
  console.log(`[Platform-Deps] Installing required native bindings conditionally (--no-save)...`);

  try {
    const packagesArg = missing.join(' ');
    // Use --no-save to keep package.json and package-lock.json clean
    execSync(`npm install --no-save --legacy-peer-deps ${packagesArg}`, {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
    console.log(`[Platform-Deps] ✓ Platform-specific native dependencies installed successfully.`);
  } catch (err) {
    console.warn(`[Platform-Deps] ⚠️ Failed to install native dependencies automatically: ${err.message}`);
  }
}

// When executed directly (e.g., node scripts/install-platform-deps.mjs or via npm lifecycle)
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const forceWin = process.argv.includes('--win32') || process.argv.includes('--windows');
  installPlatformDependencies({
    platform: forceWin ? 'win32' : process.platform,
    arch: process.arch
  });
}
