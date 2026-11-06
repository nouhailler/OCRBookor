# ==============================================================================
# OCRBookor - Automated Windows Setup Script
# Usage in Windows PowerShell:
#   irm https://raw.githubusercontent.com/nouhailler/OCRBookor/main/scripts/windows/install-windows.ps1 | iex
# ==============================================================================
[CmdletBinding()]
param(
    [string]$Version = "1.3.0",
    [string]$InstallPath = "$env:LOCALAPPDATA\Programs\OCRBookor"
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Installation d'OCRBookor v$Version pour Windows Desktop (x64)" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Vérification de Node.js
Write-Host "-> Verification de Node.js..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "❌ Node.js est introuvable." -ForegroundColor Red
    Write-Host "Veuillez installer Node.js (version 18+ ou LTS recommandée) depuis https://nodejs.org" -ForegroundColor Red
    exit 1
}
$nodeVersion = & node --version
Write-Host "✓ Node.js detecte : $nodeVersion" -ForegroundColor Green

# 2. Vérification de Python
Write-Host "-> Verification de Python..." -ForegroundColor Yellow
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    $pythonCmd = Get-Command py -ErrorAction SilentlyContinue
}
if (-not $pythonCmd) {
    Write-Host "❌ Python 3 est introuvable." -ForegroundColor Red
    Write-Host "Veuillez installer Python (3.10 ou superieur) depuis https://www.python.org" -ForegroundColor Red
    Write-Host "Assurez-vous de cocher 'Add python.exe to PATH' lors de l'installation !" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Python detecte : $($pythonCmd.Source)" -ForegroundColor Green

# 3. Création du répertoire d'installation
Write-Host "-> Dossier d'installation : $InstallPath" -ForegroundColor Yellow
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}

# 4. Téléchargement du binaire portable Windows
$zipName = "ocrbookor_${Version}_win_x64.zip"
$zipUrl = "https://github.com/nouhailler/OCRBookor/raw/main/releases/$zipName"
$tempZip = Join-Path $env:TEMP $zipName

Write-Host "-> Telechargement de l'archive binaire ($zipName)..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing
    Write-Host "✓ Archive telechargee." -ForegroundColor Green
    Write-Host "-> Extraction de l'application..." -ForegroundColor Yellow
    Expand-Archive -Path $tempZip -DestinationPath $InstallPath -Force
    Remove-Item $tempZip -Force
} catch {
    Write-Host "⚠️ Telechargement de l'archive distante non disponible ($($_.Exception.Message))." -ForegroundColor Yellow
    Write-Host "Tentative d'utilisation des sources locales si present..." -ForegroundColor Yellow
    $localZip = Join-Path (Get-Location) "releases\$zipName"
    if (Test-Path $localZip) {
        Expand-Archive -Path $localZip -DestinationPath $InstallPath -Force
        Write-Host "✓ Installe depuis l'archive locale." -ForegroundColor Green
    }
}

# 5. Installation des dépendances Python requises
$reqFile = Join-Path $InstallPath "requirements.txt"
if (Test-Path $reqFile) {
    Write-Host "-> Installation des modules Python OCR..." -ForegroundColor Yellow
    & python -m pip install --upgrade pip --quiet
    & python -m pip install -r $reqFile --quiet
    Write-Host "✓ Modules Python installes." -ForegroundColor Green
}

# 6. Création du raccourci sur le Bureau
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "OCRBookor.lnk"
$wscript = New-Object -ComObject WScript.Shell
$shortcut = $wscript.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $InstallPath "ocrbookor.cmd"
$shortcut.WorkingDirectory = $InstallPath
$shortcut.Description = "OCRBookor - Numerisation & Reconstruction EPUB 3"
$shortcut.Save()

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host "✓ OCRBookor v$Version a ete installe avec succes !" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "Raccourci disponible sur votre Bureau : $shortcutPath" -ForegroundColor White
Write-Host "Pour demarrer l'application :" -ForegroundColor White
Write-Host "  - Double-cliquez sur l'icone du Bureau" -ForegroundColor Cyan
Write-Host "  - Ou lancez dans PowerShell : & '$InstallPath\ocrbookor.cmd'" -ForegroundColor Cyan
Write-Host "L'application s'ouvrira automatiquement sur http://localhost:3000." -ForegroundColor White
Write-Host "=================================================================`n" -ForegroundColor Green
