@echo off
chcp 65001 > nul
cls
title VALIDAR Y SIMULAR PROPUESTAS DE PARCHES - APEX V25
cd /d "%~dp0"

echo =================================================================
echo   🛡️ APEX V25 — SIMULADOR Y VALIDADOR DE PARCHES DE ROSTER
echo =================================================================
echo.
echo Este proceso:
echo  1. Valida parches candidatos frente al baseline oficial V25
echo  2. Verifica que ningun parche altere identidad, Ki, tiers o forms
echo  3. Genera un reporte de propuesta/revision en enrichmentDrafts
echo  4. NO aplica cambios in-place ni modifica archivos de produccion
echo.
echo =================================================================
echo   PATCHES ARE PROPOSALS ONLY. EXPLICIT USER APPROVAL REQUIRED.
echo =================================================================
echo.
pause

echo.
echo [*] Simulando y validando parches frente a V25...
node src/scripts/applyEnrichmentPatches.js

echo.
echo =================================================================
echo   SIMULACION COMPLETADA — STATUS: PROPOSAL_ONLY_NOT_APPLIED
echo   PATCHES ARE PROPOSALS ONLY. EXPLICIT USER APPROVAL REQUIRED.
echo =================================================================
echo.
pause
