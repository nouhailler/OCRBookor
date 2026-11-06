@echo off
setlocal enabledelayedexpansion
title OCRBookor - Installation des dependances Python Windows

echo =================================================================
echo   OCRBookor - Assistant d'installation des dependances Windows
echo =================================================================
echo.

set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

:: Locate Python executable
set "PYTHON_EXE="

where python >nul 2>&1
if %ERRORLEVEL% equ 0 set "PYTHON_EXE=python"

if "%PYTHON_EXE%"=="" (
    where py >nul 2>&1
    if %ERRORLEVEL% equ 0 set "PYTHON_EXE=py -3"
)

if "%PYTHON_EXE%"=="" (
    echo [ERREUR] Python 3 est introuvable sur votre systeme.
    echo.
    echo Veuillez installer Python 3.10 ou superieur :
    echo 1. Rendez-vous sur https://www.python.org/downloads/
    echo 2. Cochez ABSOLUMENT la case 'Add python.exe to PATH' lors de l'installation !
    echo 3. Relancez ensuite ce script.
    echo.
    pause
    exit /b 1
)

echo [OK] Python detecte : %PYTHON_EXE%
echo.
echo [1/2] Mise a niveau de pip...
%PYTHON_EXE% -m pip install --upgrade pip

echo.
echo [2/2] Installation des modules OCR et de traitement documentaire...
if exist "%SCRIPT_DIR%\requirements.txt" (
    %PYTHON_EXE% -m pip install -r "%SCRIPT_DIR%\requirements.txt"
) else if exist "%SCRIPT_DIR%\..\..\requirements.txt" (
    %PYTHON_EXE% -m pip install -r "%SCRIPT_DIR%\..\..\requirements.txt"
) else (
    echo [AVERTISSEMENT] requirements.txt introuvable dans le dossier d'installation.
)

echo.
echo =================================================================
echo   Installation des dependances terminee avec succes !
echo =================================================================
echo Vous pouvez maintenant lancer OCRBookor via ocrbookor.cmd
echo.
pause
endlocal
