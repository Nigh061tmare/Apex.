@echo off
title MONITOR DE COSTOS Y TOKENS IA (DEEPSEEK / OPENCODE)
chcp 65001 >nul
cls
python "Z:\apex-powerscaling-engine\scripts\cost_tracker.py"
echo.
echo Presiona [D] para abrir el Dashboard visual en tu navegador, o cualquier otra tecla para salir...
choice /c DS /n /t 10 /d S
if errorlevel 2 goto fin
if errorlevel 1 goto open_dash

:open_dash
start "" "Z:\apex-powerscaling-engine\MONITOR_COSTOS.html"

:fin