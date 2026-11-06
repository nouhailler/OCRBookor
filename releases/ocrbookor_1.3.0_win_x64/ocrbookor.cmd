@echo off
setlocal enabledelayedexpansion
title OCRBookor Desktop v1.3.0

:: Define root directory where OCRBookor is installed
set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"

:: Local persistent data directory on Windows (%LOCALAPPDATA%\OCRBookor)
if "%OCRBOOKOR_DATA_DIR%"=="" set "OCRBOOKOR_DATA_DIR=%LOCALAPPDATA%\OCRBookor"
if not exist "%OCRBOOKOR_DATA_DIR%" mkdir "%OCRBOOKOR_DATA_DIR%"

set "NODE_ENV=production"
set "PORT=3000"
set "OCRBOOKOR_APP_ROOT=%APP_DIR%"

echo =================================================================
echo   Demarrage d'OCRBookor v1.3.0 Desktop pour Windows
echo   URL locale : http://localhost:3000
echo   Dossier de donnees : %OCRBOOKOR_DATA_DIR%
echo =================================================================

:: Check if Node.js is available in PATH
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERREUR] Node.js est introuvable dans votre variable PATH.
    echo.
    echo Pour faire fonctionner OCRBookor sur Windows :
    echo 1. Telechargez Node.js LTS depuis https://nodejs.org
    echo 2. Installez-le en conservant les options par defaut
    echo 3. Relancez OCRBookor
    echo.
    pause
    exit /b 1
)

:: Automatically open default web browser after server initializes (2 seconds)
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Start the standalone OCRBookor server
cd /d "%APP_DIR%"
node "%APP_DIR%\server.js"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERREUR] Le serveur OCRBookor s'est arrete avec le code d'erreur %ERRORLEVEL%.
    pause
)

endlocal
