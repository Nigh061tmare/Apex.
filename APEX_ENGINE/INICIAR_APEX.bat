@echo off
title APEX Engine
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js no esta instalado. Descargalo de https://nodejs.org
    pause
    exit /b 1
)

if not exist node_modules (
    echo Instalando dependencias por primera vez...
    call npm install
)

start "APEX Backend (3001)" cmd /k "npm run server"
start "APEX Web (5173)" cmd /k "npm run dev"
timeout /t 4 /nobreak >nul
start http://localhost:5173
