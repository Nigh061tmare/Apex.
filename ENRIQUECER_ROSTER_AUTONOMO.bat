@echo off
chcp 65001 > nul
cls
title ENRIQUECEDOR AUTONOMO V25 APEX
cd /d "%~dp0"
echo ================================================================
echo   🌟 APEX V25 — ENRIQUECEDOR AUTÓNOMO [DRAFT PROPOSAL MODE]
echo ================================================================
echo.
node src/scripts/interactiveEnricher.js
echo.
pause
