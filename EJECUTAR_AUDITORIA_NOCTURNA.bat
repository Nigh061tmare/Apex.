@echo off
chcp 65001 > nul
cls
title AUDITORIA NOCTURNA CONTINUA V25 - APEX
cd /d "%~dp0"
echo ================================================================
echo   🌙 APEX V25 — AUDITORÍA NOCTURNA [READ-ONLY DRAFT MODE]
echo ================================================================
echo.
echo Ejecutando auditoría nocturna en modo lectura y propuesta...
node src/scripts/runAutonomousAudit.js
echo.
pause
